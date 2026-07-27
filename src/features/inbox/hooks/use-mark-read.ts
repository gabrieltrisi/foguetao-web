"use client";

import * as React from "react";
import { useSession } from "@/providers/session-provider";
import { useMarkConversationRead } from "@/hooks/messaging/use-conversations";

/** Espera antes de marcar como lida — evita marcar em passagens rápidas (batch). */
const READ_DEBOUNCE_MS = 700;

/** A janela está realmente ativa (aba visível E foco)? */
function documentActive(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible" && document.hasFocus();
}

/**
 * Leitura REAL sincronizada (F2C). Marca a conversa como lida quando — e só quando —
 * o atendente está de fato vendo as mensagens novas:
 *  - `hasUnread` (há não-lidas para este usuário);
 *  - `isAtBottom` (a mensagem mais recente está visível, não lendo histórico);
 *  - janela ativa (aba visível + foco).
 *
 * NÃO marca lida só por abrir (decisão da F2A preservada). Debounce evita marcar em
 * passagens rápidas; o endpoint zera a conversa inteira (batch natural). Rearma
 * quando novas não-lidas chegam. Requer `messaging.conversations.update`.
 */
export function useMarkConversationReadOnView(params: {
  conversationId: string;
  hasUnread: boolean;
  isAtBottom: boolean;
}) {
  const { conversationId, hasUnread, isAtBottom } = params;
  const { can } = useSession();
  const canMark = can("messaging.conversations.update");
  const markRead = useMarkConversationRead(conversationId);

  // Marcado uma vez por "ciclo" de não-lidas; rearma quando `hasUnread` volta a false.
  const markedRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasUnread) markedRef.current = false;
  }, [hasUnread]);

  // Reavalia ao mudar visibilidade/foco da janela (arma quando a aba volta ao foco).
  const [activeTick, setActiveTick] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setActiveTick((t) => t + 1);
    document.addEventListener("visibilitychange", bump);
    window.addEventListener("focus", bump);
    window.addEventListener("blur", bump);
    return () => {
      document.removeEventListener("visibilitychange", bump);
      window.removeEventListener("focus", bump);
      window.removeEventListener("blur", bump);
    };
  }, []);

  const mutate = markRead.mutate;
  React.useEffect(() => {
    if (!canMark || !hasUnread || !isAtBottom || markedRef.current) return;
    if (!documentActive()) return;
    const timer = setTimeout(() => {
      if (!documentActive() || markedRef.current) return;
      markedRef.current = true;
      mutate();
    }, READ_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [canMark, hasUnread, isAtBottom, conversationId, activeTick, mutate]);
}
