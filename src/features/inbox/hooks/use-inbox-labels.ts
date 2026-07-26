"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { useSession } from "@/providers/session-provider";
import { inboxKeys, inboxInvalidation } from "@/features/inbox/query-keys";
import { toLabelVM, type LabelVM } from "@/features/inbox/view-models";

/** Taxonomia de etiquetas da empresa (dados REAIS — substitui o mock legado). */
export function useInboxLabels() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...inboxKeys.labels(), activeCompanyId],
    queryFn: () => messagingApi.listLabels(),
    enabled: Boolean(activeCompanyId) && can("messaging.conversations.read"),
    select: (labels): LabelVM[] => labels.map(toLabelVM),
    staleTime: 60_000,
  });
}

/** Cria etiqueta (taxonomia). Requer `messaging.labels.manage`. */
export function useCreateLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; color: string }) => messagingApi.createLabel(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: inboxInvalidation.labels }),
  });
}

/** Aplica/remove etiqueta de uma conversa (idempotente). Invalida a conversa + listas. */
export function useConversationLabelMutation() {
  const qc = useQueryClient();
  const invalidate = (conversationId: string) => {
    qc.invalidateQueries({ queryKey: inboxInvalidation.conversation(conversationId) });
    qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations });
  };
  const add = useMutation({
    mutationFn: (v: { conversationId: string; labelId: string }) =>
      messagingApi.addConversationLabel(v.conversationId, v.labelId),
    onSuccess: (_d, v) => invalidate(v.conversationId),
  });
  const remove = useMutation({
    mutationFn: (v: { conversationId: string; labelId: string }) =>
      messagingApi.removeConversationLabel(v.conversationId, v.labelId),
    onSuccess: (_d, v) => invalidate(v.conversationId),
  });
  return { add, remove };
}
