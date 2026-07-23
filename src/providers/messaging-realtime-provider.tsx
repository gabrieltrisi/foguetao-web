"use client";

import * as React from "react";
import { useMessagingRealtime } from "@/hooks/messaging/use-messaging-realtime";

/**
 * Monta o cliente realtime da Inbox (Fase 6.3C) UMA vez por aba, abaixo do
 * `SessionProvider` (empresa/permissão) e do `QueryClientProvider`. Não renderiza
 * nada além dos filhos — nenhuma UI, nenhum estado visual. A conexão EventSource
 * NÃO vive em componentes visuais da Inbox.
 */
export function MessagingRealtimeProvider({ children }: { children: React.ReactNode }) {
  useMessagingRealtime();
  return <>{children}</>;
}
