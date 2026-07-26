"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { inboxInvalidation } from "@/features/inbox/query-keys";

/**
 * Mutations operacionais da Inbox (F0). Invalidação PRECISA (conversa + listas) —
 * nunca invalida a Inbox inteira. Conflitos 409 (version) propagam como ApiError
 * (o chamador trata via `toUserError`); a mutation NUNCA os esconde.
 */
function useConversationInvalidate() {
  const qc = useQueryClient();
  return (id: string) => {
    qc.invalidateQueries({ queryKey: inboxInvalidation.conversation(id) });
    qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations });
  };
}

export function useAssignConversation() {
  const invalidate = useConversationInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; assignedToUserId: string | null }) =>
      messagingApi.assign(v.id, v.assignedToUserId as string),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useChangeConversationOwner() {
  const invalidate = useConversationInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; ownerId: string | null; expectedVersion?: number }) =>
      messagingApi.changeOwner(v.id, v.ownerId, v.expectedVersion),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useChangeConversationStatus() {
  const invalidate = useConversationInvalidate();
  const close = useMutation({
    mutationFn: (id: string) => messagingApi.close(id),
    onSuccess: (_d, id) => invalidate(id),
  });
  const reopen = useMutation({
    mutationFn: (id: string) => messagingApi.reopen(id),
    onSuccess: (_d, id) => invalidate(id),
  });
  const archive = useMutation({
    mutationFn: (id: string) => messagingApi.archive(id),
    onSuccess: (_d, id) => invalidate(id),
  });
  return { close, reopen, archive };
}

export function useCreateInternalNote() {
  const invalidate = useConversationInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; text: string }) => messagingApi.createInternalNote(v.id, v.text),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: inboxInvalidation.messages(v.id) });
      invalidate(v.id);
    },
  });
}
