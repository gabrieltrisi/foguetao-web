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
 *
 * F2D perf#3: reavaliação por foco/visibilidade é IMPERATIVA (refs + `schedule`),
 * sem `setState` — não re-renderiza a timeline a cada focus/blur.
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
  const mutate = markRead.mutate;

  const markedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Valores mais recentes para os listeners/timer lerem sem depender de re-render.
  // Sincronizado num effect (nunca escrito durante o render).
  const stateRef = React.useRef({ canMark, hasUnread, isAtBottom, mutate });
  React.useEffect(() => {
    stateRef.current = { canMark, hasUnread, isAtBottom, mutate };
  });

  // Rearma o ciclo quando as não-lidas somem (nova entrada de inbound rearma sozinha).
  React.useEffect(() => {
    if (!hasUnread) markedRef.current = false;
  }, [hasUnread]);

  const schedule = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const s = stateRef.current;
    if (!s.canMark || !s.hasUnread || !s.isAtBottom || markedRef.current) return;
    if (!documentActive()) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!documentActive() || markedRef.current) return;
      markedRef.current = true;
      stateRef.current.mutate();
    }, READ_DEBOUNCE_MS);
  }, []);

  // Reavalia ao mudar as condições (não-lidas / posição / permissão / conversa).
  React.useEffect(() => {
    schedule();
  }, [canMark, hasUnread, isAtBottom, conversationId, schedule]);

  // Reavalia ao mudar foco/visibilidade da janela — imperativo, sem setState.
  React.useEffect(() => {
    const onChange = () => schedule();
    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("blur", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("blur", onChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [schedule]);
}
