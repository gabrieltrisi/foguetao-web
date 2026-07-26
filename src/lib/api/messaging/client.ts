"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiConversation,
  ApiConversationDetail,
  ApiConversationList,
  ApiDraft,
  ApiLabel,
  ApiMessageDetail,
  ApiMessageList,
  ApiMessagingAccount,
  ApiPublicMessage,
  ApiPublicMessageList,
  ConversationFilters,
  MessageFilters,
  SendConversationMessageInput,
  SendMessageInput,
} from "@/types/api/messaging";

/** Body do autosave de rascunho. */
export interface PutDraftInput {
  text?: string;
  attachmentRefs?: string[];
  replyToMessageId?: string;
  expectedVersion?: number;
}

const B = "/api/messaging";

/** Messaging (browser → BFF). */
export const messagingApi = {
  listConversations: (filters?: ConversationFilters) =>
    clientFetch<ApiConversationList>(`${B}/conversations${buildQuery(filters as QueryParams)}`),
  getConversation: (id: string) => clientFetch<ApiConversationDetail>(`${B}/conversations/${id}`),
  assign: (id: string, assignedToUserId: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/assign`, {
      method: "POST",
      body: { assignedToUserId },
    }),
  resolve: (id: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/resolve`, { method: "POST" }),
  reopen: (id: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/reopen`, { method: "POST" }),
  archive: (id: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/archive`, { method: "POST" }),
  markRead: (id: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/read`, { method: "POST" }),

  listMessages: (conversationId: string, filters?: MessageFilters) =>
    clientFetch<ApiMessageList>(
      `${B}/conversations/${conversationId}/messages${buildQuery(filters as QueryParams)}`,
    ),
  /**
   * Histórico PÚBLICO da Inbox (Fase 6.1). Mesmo endpoint do `listMessages`, mas
   * tipado no contrato sanitizado (`ApiPublicMessage`: text/status/failure, sem
   * provider). `listMessages` (contrato antigo) segue existindo para a UI legada
   * de /conversations — não removê-lo aqui.
   */
  listPublicMessages: (conversationId: string, filters?: MessageFilters) =>
    clientFetch<ApiPublicMessageList>(
      `${B}/conversations/${conversationId}/messages${buildQuery(filters as QueryParams)}`,
    ),
  getMessage: (id: string) => clientFetch<ApiMessageDetail>(`${B}/messages/${id}`),
  sendMessage: (body: SendMessageInput) =>
    clientFetch<ApiMessageDetail>(`${B}/messages`, { method: "POST", body }),
  /** Envio CONVERSATION-SCOPED da Inbox (Fase 6.1/6.2): 202, resposta pública. */
  sendConversationMessage: (conversationId: string, body: SendConversationMessageInput) =>
    clientFetch<ApiPublicMessage>(`${B}/conversations/${conversationId}/messages`, {
      method: "POST",
      body,
    }),
  cancelMessage: (id: string) =>
    clientFetch<ApiMessageDetail>(`${B}/messages/${id}/cancel`, { method: "POST" }),

  /* Inbox operacional (C3.1B/C/D) */
  changeOwner: (id: string, ownerId: string | null, expectedVersion?: number) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/owner`, {
      method: "POST",
      body: { ownerId, expectedVersion },
    }),
  close: (id: string) =>
    clientFetch<ApiConversation>(`${B}/conversations/${id}/close`, { method: "POST" }),
  createInternalNote: (id: string, text: string) =>
    clientFetch(`${B}/conversations/${id}/internal-notes`, { method: "POST", body: { text } }),

  getDraft: (id: string) => clientFetch<ApiDraft | null>(`${B}/conversations/${id}/draft`),
  putDraft: (id: string, body: PutDraftInput) =>
    clientFetch<ApiDraft>(`${B}/conversations/${id}/draft`, { method: "PUT", body }),
  deleteDraft: (id: string) =>
    clientFetch<void>(`${B}/conversations/${id}/draft`, { method: "DELETE" }),

  listLabels: () => clientFetch<ApiLabel[]>(`${B}/labels`),
  createLabel: (body: { name: string; color: string }) =>
    clientFetch<ApiLabel>(`${B}/labels`, { method: "POST", body }),
  addConversationLabel: (id: string, labelId: string) =>
    clientFetch(`${B}/conversations/${id}/labels`, { method: "POST", body: { labelId } }),
  removeConversationLabel: (id: string, labelId: string) =>
    clientFetch(`${B}/conversations/${id}/labels/${labelId}`, { method: "DELETE" }),

  listAccounts: () => clientFetch<{ items: ApiMessagingAccount[] }>(`${B}/accounts`),
  connectAccount: (id: string) =>
    clientFetch<ApiMessagingAccount>(`${B}/accounts/${id}/connect`, { method: "POST" }),
  disconnectAccount: (id: string) =>
    clientFetch<ApiMessagingAccount>(`${B}/accounts/${id}/disconnect`, { method: "POST" }),
  testAccount: (id: string) => clientFetch(`${B}/accounts/${id}/test`, { method: "POST" }),
};
