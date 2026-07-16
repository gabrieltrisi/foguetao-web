"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { ConversationFilters } from "@/types/api/messaging";

/**
 * Conversas — UMA página (usado onde não há "carregar mais", como o card do
 * Dashboard).
 *
 * `messaging.conversations.read`: VIEWER não tem nenhuma permissão de messaging,
 * então a query nem sai e a tela mostra o estado de permissão negada.
 */
export function useConversations(filters?: ConversationFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.messaging.conversations(filters), activeCompanyId],
    queryFn: () => messagingApi.listConversations(filters),
    enabled: Boolean(activeCompanyId) && can("messaging.conversations.read"),
    placeholderData: (prev) => prev,
  });
}

/**
 * Conversas paginadas por CURSOR. `useInfiniteQuery` acumula as páginas e
 * reinicia sozinho quando o filtro muda (a queryKey muda) — sem estado manual
 * de cursor nem efeitos de sincronização.
 */
export function useConversationsInfinite(filters?: ConversationFilters) {
  const { activeCompanyId, can } = useSession();
  return useInfiniteQuery({
    queryKey: [...queryKeys.messaging.conversations(filters), activeCompanyId, "infinite"],
    queryFn: ({ pageParam }) =>
      messagingApi.listConversations({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    // O contrato diz quando há mais e qual o próximo cursor.
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: Boolean(activeCompanyId) && can("messaging.conversations.read"),
  });
}

export function useConversation(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.messaging.conversation(id), activeCompanyId],
    queryFn: () => messagingApi.getConversation(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("messaging.conversations.read"),
  });
}

/** Invalida a conversa + todas as listas (status/unread mudam a listagem). */
function useConversationInvalidation(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(id) });
    qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
  };
}

export function useAssignConversation(id: string) {
  const invalidate = useConversationInvalidation(id);
  return useMutation({
    mutationFn: (assignedToUserId: string) => messagingApi.assign(id, assignedToUserId),
    onSuccess: invalidate,
  });
}

export function useResolveConversation(id: string) {
  const invalidate = useConversationInvalidation(id);
  return useMutation({ mutationFn: () => messagingApi.resolve(id), onSuccess: invalidate });
}

export function useReopenConversation(id: string) {
  const invalidate = useConversationInvalidation(id);
  return useMutation({ mutationFn: () => messagingApi.reopen(id), onSuccess: invalidate });
}

export function useArchiveConversation(id: string) {
  const invalidate = useConversationInvalidation(id);
  return useMutation({ mutationFn: () => messagingApi.archive(id), onSuccess: invalidate });
}

/** Zera o unreadCount (sem read receipt externo — o contrato é explícito). */
export function useMarkConversationRead(id: string) {
  const invalidate = useConversationInvalidation(id);
  return useMutation({ mutationFn: () => messagingApi.markRead(id), onSuccess: invalidate });
}
