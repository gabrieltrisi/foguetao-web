"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMessagingRealtime } from "@/hooks/messaging/use-messaging-realtime";
import {
  INITIAL_REALTIME_STATE,
  type RealtimeConnectionState,
} from "@/lib/messaging/realtime-connection";

/** Prefixo de reconciliação do polling fallback (só o domínio messaging). */
const MESSAGING_ROOT_KEY = ["messaging"] as const;
/** Intervalo do polling fallback quando o SSE NÃO está saudável (reconnecting/erro). */
const POLL_INTERVAL_MS = 15_000;

const RealtimeStatusContext = React.createContext<RealtimeConnectionState>(INITIAL_REALTIME_STATE);

/** Estado da conexão realtime da Inbox (para status na UI e diagnóstico). */
export function useRealtimeStatus(): RealtimeConnectionState {
  return React.useContext(RealtimeStatusContext);
}

/**
 * Monta o cliente realtime da Inbox UMA vez por aba, abaixo do `SessionProvider` e
 * do `QueryClientProvider`. Expõe o estado da conexão via contexto e roda o POLLING
 * FALLBACK (reconciliação HTTP) enquanto o stream não está saudável — pausando com
 * aba oculta/offline. Nunca abre conexão em componentes visuais.
 */
export function MessagingRealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const state = useMessagingRealtime();

  // Polling fallback: SÓ quando o SSE não está saudável (pollingActive). Reconcilia
  // via invalidação do domínio messaging (ativos refazem). Pausa em aba oculta e
  // offline. Conectado → sem polling (o stream já entrega). Sem timers espalhados.
  React.useEffect(() => {
    if (!state.pollingActive || typeof window === "undefined") return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      qc.invalidateQueries({ queryKey: MESSAGING_ROOT_KEY });
    };
    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [state.pollingActive, qc]);

  return (
    <RealtimeStatusContext.Provider value={state}>{children}</RealtimeStatusContext.Provider>
  );
}
