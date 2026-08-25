"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { inboxInvalidation } from "@/features/inbox/query-keys";
import { patchConversationDetail } from "@/features/inbox/conversation-cache";

/**
 * Mutations operacionais da Inbox (F0/F4). Invalidação PRECISA (conversa + listas) —
 * nunca a Inbox inteira. Assignment/status são OTIMISTAS (patch do detalhe + rollback
 * em erro; `onSettled` reconcilia). Conflitos (409 version / 422 transição inválida)
 * propagam como ApiError — o chamador trata via toast; a mutation NUNCA os esconde.
 */
function useConversationInvalidate() {
  const qc = useQueryClient();
  return (id: string) => {
    qc.invalidateQueries({ queryKey: inboxInvalidation.conversation(id) });
    qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations });
  };
}

type Rollback = { rollback?: () => void };

/** Atribuir / transferir / remover responsável. `assignedToUserId=null` remove. */
export function useAssignConversation() {
  const qc = useQueryClient();
  const invalidate = useConversationInvalidate();
  return useMutation<unknown, unknown, { id: string; assignedToUserId: string | null; expectedVersion?: number }, Rollback>({
    mutationFn: (v) => messagingApi.assign(v.id, v.assignedToUserId, v.expectedVersion),
    onMutate: (v) => ({
      rollback: patchConversationDetail(qc, v.id, (c) => ({ ...c, assignedToUserId: v.assignedToUserId })),
    }),
    onError: (_e, _v, ctx) => ctx?.rollback?.(),
    onSettled: (_d, _e, v) => invalidate(v.id),
  });
}

/** Cria/vincula um Contact a partir desta conversa. Invalida a conversa (contactId muda). */
export function useCreateContactFromConversation() {
  const invalidate = useConversationInvalidate();
  return useMutation<{ contactId: string; created: boolean }, unknown, string>({
    mutationFn: (id) => messagingApi.createContactFromConversation(id),
    onSettled: (_d, _e, id) => invalidate(id),
  });
}

/** Envia uma imagem (base64) na conversa (outbound de mídia). Invalida a timeline. */
export function useSendConversationImage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation<
    { id: string },
    unknown,
    { base64: string; mimeType: string; filename?: string; caption?: string }
  >({
    mutationFn: (body) => messagingApi.sendConversationImage(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inboxInvalidation.messages(conversationId) });
      qc.invalidateQueries({ queryKey: inboxInvalidation.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations });
    },
  });
}

/** Importa contatos de TODAS as conversas (dedupe por telefone). */
export function useImportContactsFromConversations() {
  const qc = useQueryClient();
  return useMutation<{ imported: number; linked: number; scanned: number }, unknown, void>({
    mutationFn: () => messagingApi.importContactsFromConversations(),
    onSettled: () => qc.invalidateQueries({ queryKey: inboxInvalidation.allConversations }),
  });
}

/** Owner COMERCIAL (≠ atendente). `ownerId=null` remove. Optimistic-lock opcional. */
export function useChangeConversationOwner() {
  const qc = useQueryClient();
  const invalidate = useConversationInvalidate();
  return useMutation<unknown, unknown, { id: string; ownerId: string | null; expectedVersion?: number }, Rollback>({
    mutationFn: (v) => messagingApi.changeOwner(v.id, v.ownerId, v.expectedVersion),
    onMutate: (v) => ({
      rollback: patchConversationDetail(qc, v.id, (c) => ({ ...c, ownerId: v.ownerId })),
    }),
    onError: (_e, _v, ctx) => ctx?.rollback?.(),
    onSettled: (_d, _e, v) => invalidate(v.id),
  });
}

/**
 * Transições de status DIRIGIDAS por agente (F4). Enum real: OPEN/PENDING/RESOLVED/
 * ARCHIVED/BLOCKED. Endpoints: resolve/close→RESOLVED, reopen→OPEN, archive→ARCHIVED.
 * Cada uma é otimista (patch do status no detalhe + rollback). Sem `expectedVersion`
 * (o backend usa só 422 de transição inválida).
 */
export function useChangeConversationStatus() {
  const qc = useQueryClient();
  const invalidate = useConversationInvalidate();

  const optimistic = (target: string) => ({
    onMutate: (id: string): Rollback => ({
      rollback: patchConversationDetail(qc, id, (c) => ({ ...c, status: target })),
    }),
    onError: (_e: unknown, _id: string, ctx?: Rollback) => ctx?.rollback?.(),
    onSettled: (_d: unknown, _e: unknown, id: string) => invalidate(id),
  });

  const resolve = useMutation<unknown, unknown, string, Rollback>({
    mutationFn: (id) => messagingApi.resolve(id),
    ...optimistic("RESOLVED"),
  });
  const reopen = useMutation<unknown, unknown, string, Rollback>({
    mutationFn: (id) => messagingApi.reopen(id),
    ...optimistic("OPEN"),
  });
  const archive = useMutation<unknown, unknown, string, Rollback>({
    mutationFn: (id) => messagingApi.archive(id),
    ...optimistic("ARCHIVED"),
  });
  const close = useMutation<unknown, unknown, string, Rollback>({
    mutationFn: (id) => messagingApi.close(id),
    ...optimistic("RESOLVED"),
  });
  return { resolve, reopen, archive, close };
}

/** Nota interna (F3). Invalida mensagens + conversa/listas. */
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
