"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/providers/session-provider";
import { createMessagingEventSource } from "@/lib/messaging/realtime-source";
import { parseRealtimeEnvelope, REALTIME_EVENT_TYPES } from "@/lib/messaging/realtime-events";
import { applyRealtimeEvent } from "@/lib/messaging/realtime-cache";

/** Prefixo de TODAS as queries de messaging (nunca invalida fora deste domínio). */
const MESSAGING_ROOT_KEY = ["messaging"] as const;
const EVENT_NAMES = Object.values(REALTIME_EVENT_TYPES);
/** Backoff manual (evita loop nativo agressivo em 503/feature desligada). */
const BACKOFF_MS = [1000, 2000, 5000, 10000, 20000, 30000];
/** Coalescência de invalidações em rajada. */
const INVALIDATE_DEBOUNCE_MS = 100;

/**
 * Cliente realtime da Inbox (Fase 6.3C). UMA conexão EventSource por aba e por
 * empresa ativa. Conecta só com sessão pronta + empresa + permissão de leitura.
 * Traduz eventos SSE em atualizações do cache do React Query (fonte única). Sem
 * store paralela, sem UI, sem rerender por evento (tudo via ref/cache).
 *
 * `factory` é injetável para testes (FakeEventSource).
 */
export function useMessagingRealtime(
  factory: () => EventSource = createMessagingEventSource,
): void {
  const qc = useQueryClient();
  const { status, activeCompanyId, can } = useSession();
  const ready =
    status === "ready" && Boolean(activeCompanyId) && can("messaging.conversations.read");

  React.useEffect(() => {
    // Só no cliente (SSR não abre stream). A criação do EventSource fica a cargo
    // da factory (default same-origin; fake nos testes).
    if (!ready || !activeCompanyId || typeof window === "undefined") {
      return;
    }

    const companyId = activeCompanyId; // capturado POR conexão (evita race na troca)
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
      applyRealtimeEvent(qc, event, scheduleInvalidate);
    };

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      if (stopped) return;
      const source = factory();
      es = source;

      source.onopen = () => {
        const wasReconnect = hadError;
        hadError = false;
        backoffIndex = 0;
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
        const delay = BACKOFF_MS[Math.min(backoffIndex, BACKOFF_MS.length - 1)];
        backoffIndex += 1;
        clearReconnect();
        reconnectTimer = setTimeout(connect, delay);
      };

      for (const name of EVENT_NAMES) {
        source.addEventListener(name, onMessageEvent as EventListener);
      }
    };

    connect();

    return () => {
      stopped = true;
      clearReconnect();
      if (invalidateTimer) clearTimeout(invalidateTimer);
      pending.clear();
      if (es) {
        for (const name of EVENT_NAMES) {
          es.removeEventListener(name, onMessageEvent as EventListener);
        }
        es.onopen = null;
        es.onerror = null;
        es.close();
        es = null;
      }
    };
  }, [ready, activeCompanyId, qc, factory]);
}
