"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import {
  buildOptimisticNote,
  buildReconciledNote,
  reconcileServerMessage,
  removeTemp,
  tempIdFor,
  upsertMessage,
} from "@/features/inbox/optimistic";
import type { ApiMessage, ApiPublicMessageListItems } from "@/types/api/messaging";

type NoteVars = { text: string; clientMessageId: string };
type NoteCtx = { tempId?: string };

/**
 * Envio OTIMISTA de NOTA INTERNA (F3). Endpoint DEDICADO
 * `POST /conversations/:id/internal-notes` (só texto; 201 SÍNCRONO; status SENT; perm
 * `messaging.conversations.note`). NUNCA passa pelo envio público → a nota jamais vaza
 * ao provider/cliente.
 *
 * `onMutate` insere uma nota otimista `INTERNAL` (renderiza como nota, nunca bolha
 * pública). `onSuccess` reconcilia com o item construído do texto LOCAL + id/timestamps
 * do servidor (o response da nota traz `preview`, não `text`). Idempotente por id;
 * `reconcileServerMessage` preserva `visibility=INTERNAL` mesmo se um eco por SSE sem
 * visibility chegar depois. `onError` marca FAILED preservando o texto.
 */
export function useSendInternalNote(conversationId: string) {
  const qc = useQueryClient();
  const { user } = useSession();
  const key = messagingInvalidation.messages(conversationId);
  return useMutation<ApiMessage, unknown, NoteVars, NoteCtx>({
    mutationFn: (v) => messagingApi.createInternalNote(conversationId, v.text),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const tempId = tempIdFor(v.clientMessageId);
      const optimistic = buildOptimisticNote({
        clientMessageId: v.clientMessageId,
        text: v.text,
        senderUserId: user?.id ?? null,
        createdAt: new Date().toISOString(),
      });
      qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
        upsertMessage(old, optimistic),
      );
      return { tempId };
    },
    onSuccess: (note, v, ctx) => {
      const item = buildReconciledNote({
        id: note.id,
        text: v.text,
        senderUserId: user?.id ?? null,
        createdAt: note.createdAt,
        sentAt: note.sentAt,
        status: note.status,
        replyToMessageId: note.replyToMessageId,
      });
      qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
        reconcileServerMessage(old, item, ctx?.tempId),
      );
      qc.invalidateQueries({ queryKey: messagingInvalidation.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: messagingInvalidation.allConversations });
    },
    onError: (_error, _v, ctx) => {
      // A nota interna não renderiza "falhou"/retry → remove a temp (sem nota fantasma).
      // O composer preserva o texto e mostra um toast.
      if (ctx?.tempId) {
        qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>({ queryKey: key }, (old) =>
          removeTemp(old, ctx.tempId as string),
        );
      }
    },
  });
}
