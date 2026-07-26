"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/session-provider";
import { createMessagingEventSource } from "@/lib/messaging/realtime-source";
import { parseRealtimeEnvelope, REALTIME_EVENT_TYPES } from "@/lib/messaging/realtime-events";
import { applyRealtimeEvent } from "@/lib/messaging/realtime-cache";
import {
  INITIAL_REALTIME_STATE,
  SeenEventCache,
  shouldPoll,
  type RealtimeConnectionState,
  type RealtimeConnectionStatus,
} from "@/lib/messaging/realtime-connection";

/** Prefixo de TODAS as queries de messaging (nunca invalida fora deste domínio). */
const MESSAGING_ROOT_KEY = ["messaging"] as const;
const EVENT_NAMES = Object.values(REALTIME_EVENT_TYPES);
/** Backoff manual (evita loop nativo agressivo em 503/feature desligada). */
const BACKOFF_MS = [1000, 2000, 5000, 10000, 20000, 30000];
/** Coalescência de invalidações em rajada. */
const INVALIDATE_DEBOUNCE_MS = 100;

/**
 * Cliente realtime da Inbox (Fase 6.3C → C3.1D). UMA conexão EventSource por aba e
 * por empresa ativa. Conecta só com sessão pronta + empresa + permissão de leitura.
 * Traduz eventos SSE em atualizações do cache do React Query (fonte única). Dedup
 * por `eventId` (at-least-once), tratamento de offline/online e ESTADO de conexão
 * exposto (para status na UI + gating do polling fallback).
 *
 * `factory` é injetável para testes (FakeEventSource).
 */
export function useMessagingRealtime(
  factory: () => EventSource = createMessagingEventSource,
): RealtimeConnectionState {
  const qc = useQueryClient();
  const { status, activeCompanyId, can } = useSession();
  const ready =
    status === "ready" && Boolean(activeCompanyId) && can("messaging.conversations.read");

  const [state, setState] = React.useState<RealtimeConnectionState>(INITIAL_REALTIME_STATE);
  const setStatus = React.useCallback(
    (next: RealtimeConnectionStatus, resetAttempts = false) =>
      setState((s) => ({
        status: next,
        reconnectAttempts:
          next === "reconnecting"
            ? s.reconnectAttempts + 1
            : resetAttempts
              ? 0
              : s.reconnectAttempts,
        pollingActive: shouldPoll(next),
      })),
    [],
  );

  React.useEffect(() => {
    // Sem sessão/empresa/permissão: não abre stream. O estado exposto é derivado
    // como `idle` no retorno (sem setState no corpo do efeito → sem cascata).
    if (!ready || !activeCompanyId || typeof window === "undefined") {
      return;
    }

    const companyId = activeCompanyId; // capturado POR conexão (evita race na troca)
    const seen = new SeenEventCache(500); // dedup por eventId (bounded, sem crescer infinito)
    let es: EventSource | null = null;
    let stopped = false;
    let hadError = false; // distingue 1ª abertura de reconexão pós-erro
    let backoffIndex = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // --- Invalidações coalescidas (debounce curto) ---
    const pending = new Map<string, readonly unknown[]>();
    let invalidateTimer: ReturnType<typeof setTimeout> | null = null;
    const flushInvalidate = () => {
      invalidateTimer = null;
      for (const key of pending.values()) qc.invalidateQueries({ queryKey: key });
      pending.clear();
    };
    const scheduleInvalidate = (key: readonly unknown[]) => {
      pending.set(JSON.stringify(key), key);
      if (!invalidateTimer) invalidateTimer = setTimeout(flushInvalidate, INVALIDATE_DEBOUNCE_MS);
    };

    // --- Recepção de eventos ---
    const onMessageEvent = (e: MessageEvent) => {
      if (stopped) return;
      const event = parseRealtimeEnvelope(e.data as string);
      if (!event) return; // inválido → ignora (não toca cache, não derruba conexão)
      if (event.companyId !== companyId) return; // tenant divergente → ignora
      if (!seen.add(event.id)) return; // duplicado (at-least-once) → ignora
      applyRealtimeEvent(qc, event, scheduleInvalidate);
    };

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const closeEs = () => {
      if (!es) return;
      for (const name of EVENT_NAMES) es.removeEventListener(name, onMessageEvent as EventListener);
      es.onopen = null;
      es.onerror = null;
      es.close();
      es = null;
    };

    const connect = () => {
      if (stopped) return;
      // Offline: não abre stream (o evento 'online' religa). Estado = offline.
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setStatus("offline");
        return;
      }
      setStatus(hadError ? "reconnecting" : "connecting");
      const source = factory();
      es = source;

      source.onopen = () => {
        const wasReconnect = hadError;
        hadError = false;
        backoffIndex = 0;
        setStatus("connected", true);
        // Reconexão: recupera estado invalidando SÓ messaging (ativos refazem;
        // inativos ficam stale). Primeira abertura NÃO invalida.
        if (wasReconnect && !stopped) {
          qc.invalidateQueries({ queryKey: MESSAGING_ROOT_KEY });
        }
      };

      source.onerror = () => {
        // Fecha e reconecta com UM timer + backoff (não mistura com reconnect nativo).
        hadError = true;
        source.close();
        if (es === source) es = null;
        if (stopped) return;
        // Offline: não insiste no backoff — espera o evento 'online' religar.
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          setStatus("offline");
          return;
        }
        setStatus("reconnecting");
        const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)];
        backoffIndex += 1;
        clearReconnect();
        reconnectTimer = setTimeout(connect, delay);
      };

      for (const name of EVENT_NAMES) {
        source.addEventListener(name, onMessageEvent as EventListener);
      }
    };

    // --- Offline/online: pausa e retoma sem hammering ---
    const handleOffline = () => {
      setStatus("offline");
      clearReconnect();
      closeEs();
    };
    const handleOnline = () => {
      if (stopped) return;
      backoffIndex = 0;
      hadError = true; // reabertura pós-lacuna → invalida messaging no onopen
      clearReconnect();
      connect();
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    connect(); // trata offline internamente (não abre stream sem rede)

    return () => {
      stopped = true;
      clearReconnect();
      if (invalidateTimer) clearTimeout(invalidateTimer);
      pending.clear();
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      closeEs();
    };
  }, [ready, activeCompanyId, qc, factory, setStatus]);

  // Sem conexão ativa (sessão não pronta / sem empresa / sem permissão) → idle.
  return ready ? state : INITIAL_REALTIME_STATE;
}
