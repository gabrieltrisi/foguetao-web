"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { useSession } from "@/providers/session-provider";
import { inboxKeys, inboxInvalidation } from "@/features/inbox/query-keys";
import { patchConversationDetail } from "@/features/inbox/conversation-cache";
import { toLabelVM, type LabelVM } from "@/features/inbox/view-models";
import type { ApiLabelRef } from "@/types/api/messaging";

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

type Rollback = { rollback?: () => void };

/**
 * Aplica/remove etiqueta de uma conversa (idempotente, multi-label). OTIMISTA: o chip
 * aparece/some na hora (patch do detalhe + rollback em erro; `onSettled` reconcilia). O
 * `add` recebe o `label` (ref) para o append otimista; `remove` filtra por `labelId`.
 */
export function useConversationLabelMutation() {
  const qc = useQueryClient();
  const invalidate = (conversationId: string) => {
    qc.invalidateQueries({ queryKey: inboxInvalidation.conversation(conversationId) });
    qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations });
  };
  const add = useMutation<unknown, unknown, { conversationId: string; labelId: string; label?: ApiLabelRef }, Rollback>({
    mutationFn: (v) => messagingApi.addConversationLabel(v.conversationId, v.labelId),
    onMutate: (v) => {
      if (!v.label) return {};
      return {
        rollback: patchConversationDetail(qc, v.conversationId, (c) => {
          const labels = c.labels ?? [];
          if (labels.some((l) => l.id === v.labelId)) return c; // idempotente
          return { ...c, labels: [...labels, v.label as ApiLabelRef] };
        }),
      };
    },
    onError: (_e, _v, ctx) => ctx?.rollback?.(),
    onSettled: (_d, _e, v) => invalidate(v.conversationId),
  });
  const remove = useMutation<unknown, unknown, { conversationId: string; labelId: string }, Rollback>({
    mutationFn: (v) => messagingApi.removeConversationLabel(v.conversationId, v.labelId),
    onMutate: (v) => ({
      rollback: patchConversationDetail(qc, v.conversationId, (c) => ({
        ...c,
        labels: (c.labels ?? []).filter((l) => l.id !== v.labelId),
      })),
    }),
    onError: (_e, _v, ctx) => ctx?.rollback?.(),
    onSettled: (_d, _e, v) => invalidate(v.conversationId),
  });
  return { add, remove };
}
