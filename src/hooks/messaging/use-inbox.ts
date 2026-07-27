"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import { toUserErrorMessage } from "@/lib/api/user-error-message";
import {
  buildOptimisticMessage,
  localSendFailure,
  markTempFailed,
  reconcileServerMessage,
  tempIdFor,
  upsertMessage,
} from "@/features/inbox/optimistic";
import type {
  ApiPublicMessage,
  ApiPublicMessageList,
  ApiPublicMessageListItems,
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

type SendContext = { tempId?: string };

/**
 * Envio OTIMISTA conversation-scoped da Inbox (F2C). React Query é a fonte única —
 * sem estado paralelo:
 *  - `onMutate` (só envio imediato — agendado NÃO é otimista): insere a mensagem
 *    local (`temp:<clientMessageId>`, SENDING) na hora, sem esperar o servidor;
 *  - `onSuccess`: reconcilia a temp pela mensagem REAL (id do servidor) e invalida
 *    conversa/listas (preview, ordenação, não-lidas). Idempotente com o eco por SSE
 *    (`message.created`), que colapsa a mesma temp;
 *  - `onError`: marca a temp como FAILED preservando o texto (retry na timeline).
 *
 * O eco por SSE é seguro: `reconcileServerMessage`/`upsertMessage` deduplicam por id
 * e colapsam a temp de mesmo texto — sem duplicar nem regredir status (§realtime).
 */
export function useSendInboxMessage(conversationId: string) {
  const qc = useQueryClient();
  const { user } = useSession();
  const key = messagingInvalidation.messages(conversationId);
  return useMutation<ApiPublicMessage, unknown, SendConversationMessageInput, SendContext>({
    mutationFn: (body) => messagingApi.sendConversationMessage(conversationId, body),
    onMutate: async (body) => {
      // Agendada (sendAt): sem otimismo — a mensagem não é "enviando agora".
      if (body.sendAt) return {};
      await qc.cancelQueries({ queryKey: key });
      const tempId = tempIdFor(body.clientMessageId);
      const optimistic = buildOptimisticMessage({
        clientMessageId: body.clientMessageId,
        text: body.text,
        senderUserId: user?.id ?? null,
        createdAt: new Date().toISOString(),
      });
      qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
        upsertMessage(old, optimistic),
      );
      return { tempId };
    },
    onSuccess: (message, _body, ctx) => {
      qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
        reconcileServerMessage(old, message, ctx?.tempId),
      );
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
    },
    onError: (error, _body, ctx) => {
      if (ctx?.tempId) {
        qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
          markTempFailed(old, ctx.tempId as string, localSendFailure(toUserErrorMessage(error))),
        );
      }
      // Sendability pode ter mudado (409/422) — recarrega o detalhe.
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
    },
  });
}

/**
 * Cancela uma mensagem agendada (PENDING/QUEUED) antes do despacho (Sprint 7.2).
 * Reusa o cancelamento genérico existente. O realtime também empurra a transição
 * para CANCELED; a invalidação garante consistência mesmo sem SSE.
 */
export function useCancelInboxMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => messagingApi.cancelMessage(messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingInvalidation.messages(conversationId) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
    },
  });
}
