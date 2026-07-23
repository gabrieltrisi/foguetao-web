"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type {
  ApiPublicMessage,
  ApiPublicMessageList,
  MessageFilters,
  SendConversationMessageInput,
} from "@/types/api/messaging";

/**
 * Histórico da Inbox (Fase 6.2) — DTO PÚBLICO (`ApiPublicMessage`: text/status
 * público/failure, sem provider). Paginação por CURSOR: o backend devolve as
 * mais recentes primeiro e "carregar anteriores" busca as mais antigas; a UI
 * ordena cronologicamente na exibição.
 *
 * Fonte única (React Query) — não há store paralela. O sufixo `"public"` separa
 * do cache do contrato antigo (`useMessages` de /conversations), mas o prefixo
 * `messaging.conversation:id:messages` permanece, então
 * `messagingInvalidation.messages(id)` invalida ambos.
 */
export function useInboxMessages(conversationId: string, filters?: MessageFilters) {
  const { activeCompanyId, can } = useSession();
  return useInfiniteQuery({
    queryKey: [...queryKeys.messaging.messages(conversationId, filters), activeCompanyId, "public"],
    queryFn: ({ pageParam }) =>
      messagingApi.listPublicMessages(conversationId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: Boolean(activeCompanyId) && Boolean(conversationId) && can("messaging.messages.read"),
  });
}

/**
 * Insere/atualiza a mensagem no TOPO (mais recente) do cache infinito. O contrato
 * pagina do mais recente para o mais antigo, então a recém-enviada entra no início
 * da primeira página. Idempotente: se já existir (mesmo id), é substituída — nunca
 * duplica.
 */
export function upsertNewestMessage(
  data: InfiniteData<ApiPublicMessageList> | undefined,
  message: ApiPublicMessage,
): InfiniteData<ApiPublicMessageList> | undefined {
  if (!data || data.pages.length === 0) return data;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((m) => m.id !== message.id),
  }));
  pages[0] = { ...pages[0], items: [message, ...pages[0].items] };
  return { ...data, pages };
}

/**
 * Envio conversation-scoped da Inbox (Fase 6.2). Em 202/QUEUED atualiza o CACHE
 * (React Query, fonte única — sem estado paralelo):
 *  - histórico: eco imediato da mensagem retornada;
 *  - conversa + listas: invalidadas para reconciliar preview, ordenação e não-lidas.
 * Em erro (incl. 409/422) recarrega o detalhe, pois a sendability pode ter mudado.
 */
export function useSendInboxMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendConversationMessageInput) =>
      messagingApi.sendConversationMessage(conversationId, body),
    onSuccess: (message) => {
      qc.setQueriesData<InfiniteData<ApiPublicMessageList>>(
        { queryKey: messagingInvalidation.messages(conversationId) },
        (old) => upsertNewestMessage(old, message),
      );
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
    },
  });
}
