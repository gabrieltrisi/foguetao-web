"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { MessageFilters, SendMessageInput } from "@/types/api/messaging";

/**
 * Mensagens de uma conversa, paginadas por CURSOR. O contrato devolve as mais
 * recentes primeiro e "carregar mais" busca as ANTERIORES; a UI ordena
 * cronologicamente na exibição (`groupByDay`).
 */
export function useMessages(conversationId: string, filters?: MessageFilters) {
  const { activeCompanyId, can } = useSession();
  return useInfiniteQuery({
    queryKey: [...queryKeys.messaging.messages(conversationId, filters), activeCompanyId],
    queryFn: ({ pageParam }) =>
      messagingApi.listMessages(conversationId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: Boolean(activeCompanyId) && Boolean(conversationId) && can("messaging.messages.read"),
  });
}

/** Conteúdo completo de UMA mensagem — a listagem só traz `preview`. */
export function useMessageDetail(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.messaging.message(id ?? ""), activeCompanyId],
    queryFn: () => messagingApi.getMessage(id as string),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("messaging.messages.read"),
  });
}

/**
 * Envia (202 — assíncrono). Sem realtime nesta sprint: após o aceite, o
 * refetch das mensagens é quem traz o estado novo.
 */
export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageInput) => messagingApi.sendMessage(body),
    onSuccess: (message) => {
      const id = conversationId ?? message.conversationId;
      qc.invalidateQueries({ queryKey: messagingInvalidation.messages(id) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(id) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
    },
  });
}

/** Cancela uma mensagem ainda não enviada (só PENDING/QUEUED). */
export function useCancelMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => messagingApi.cancelMessage(messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingInvalidation.messages(conversationId) });
    },
  });
}
