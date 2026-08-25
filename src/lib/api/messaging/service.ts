import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  conversationListSchema,
  conversationDetailSchema,
  conversationSummarySchema,
  messageDetailSchema,
  messagingAccountSchema,
  messagingAccountListSchema,
  publicMessageListItemsSchema,
  publicMessageSchema,
  draftSchema,
  labelSchema,
  labelListSchema,
  readResultSchema,
  mediaResponseSchema,
} from "@/types/api/messaging";

interface Ctx {
  token: string;
  companyId: string;
}

/** Envio/cancelamento devolvem a mensagem; só o detalhe traz `content`. */
const messageSummaryOrDetail = messageDetailSchema.partial({ content: true });

/** Messaging (Sprint 1.3) — server → backend, validado por Zod. */
export const messagingService = {
  /* Conversas */
  listConversations: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/messaging/conversations${buildQuery(params)}`, {
      token,
      companyId,
      schema: conversationListSchema,
    }),
  getConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}`, {
      token,
      companyId,
      schema: conversationDetailSchema,
    }),
  createContactFromConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/contact`, { method: "POST", token, companyId }),
  importContactsFromConversations: ({ token, companyId }: Ctx) =>
    backendFetch(`/messaging/conversations/import-contacts`, { method: "POST", token, companyId }),
  assignConversation: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/messaging/conversations/${id}/assign`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: conversationSummarySchema,
    }),
  resolveConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/resolve`, {
      method: "POST",
      token,
      companyId,
      schema: conversationSummarySchema,
    }),
  reopenConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/reopen`, {
      method: "POST",
      token,
      companyId,
      schema: conversationSummarySchema,
    }),
  archiveConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/archive`, {
      method: "POST",
      token,
      companyId,
      schema: conversationSummarySchema,
    }),
  markConversationRead: ({ token, companyId }: Ctx, id: string, body?: unknown) =>
    backendFetch(`/messaging/conversations/${id}/read`, {
      method: "POST",
      token,
      companyId,
      body: body ?? {},
      schema: readResultSchema,
    }),
  /* Inbox operacional (C3.1B/C) — owner/close + notas + rascunhos + etiquetas. */
  changeOwner: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/messaging/conversations/${id}/owner`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: conversationSummarySchema,
    }),
  closeConversation: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/close`, {
      method: "POST",
      token,
      companyId,
      schema: conversationSummarySchema,
    }),
  createInternalNote: ({ token, companyId }: Ctx, id: string, body: { text: string }) =>
    backendFetch(`/messaging/conversations/${id}/internal-notes`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: messageSummaryOrDetail,
    }),

  /* Rascunhos (por usuário, cifrados no backend) */
  getDraft: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/draft`, {
      token,
      companyId,
      schema: draftSchema.nullable().catch(null),
    }),
  putDraft: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/messaging/conversations/${id}/draft`, {
      method: "PUT",
      token,
      companyId,
      body,
      schema: draftSchema,
    }),
  deleteDraft: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/conversations/${id}/draft`, { method: "DELETE", token, companyId }),

  /* Etiquetas */
  listLabels: ({ token, companyId }: Ctx) =>
    backendFetch(`/messaging/labels`, { token, companyId, schema: labelListSchema }),
  createLabel: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/messaging/labels`, { method: "POST", token, companyId, body, schema: labelSchema }),
  addConversationLabel: ({ token, companyId }: Ctx, id: string, body: { labelId: string }) =>
    backendFetch(`/messaging/conversations/${id}/labels`, {
      method: "POST",
      token,
      companyId,
      body,
    }),
  removeConversationLabel: ({ token, companyId }: Ctx, id: string, labelId: string) =>
    backendFetch(`/messaging/conversations/${id}/labels/${labelId}`, {
      method: "DELETE",
      token,
      companyId,
    }),

  /* Mensagens */
  /** Histórico da conversa (Fase 6.1: DTO público sanitizado, com `text`). */
  listMessages: ({ token, companyId }: Ctx, conversationId: string, params?: QueryParams) =>
    backendFetch(`/messaging/conversations/${conversationId}/messages${buildQuery(params)}`, {
      token,
      companyId,
      schema: publicMessageListItemsSchema,
    }),
  getMessage: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/messages/${id}`, { token, companyId, schema: messageDetailSchema }),
  /** 202 ACCEPTED — envio account-scoped LEGADO (não usado pela nova Inbox). */
  sendMessage: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/messaging/messages`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: messageSummaryOrDetail,
    }),
  /**
   * Envio CONVERSATION-SCOPED da Inbox (Fase 6.1/6.2): 202/QUEUED, idempotente
   * por `clientMessageId`. Body: { text, clientMessageId }. Nunca envia
   * messagingAccountId/provider. Resposta: DTO público sanitizado.
   */
  sendConversationMessage: (
    { token, companyId }: Ctx,
    conversationId: string,
    body: { text: string; clientMessageId: string },
  ) =>
    backendFetch(`/messaging/conversations/${conversationId}/messages`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: publicMessageSchema,
    }),
  cancelMessage: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/messages/${id}/cancel`, {
      method: "POST",
      token,
      companyId,
      schema: messageSummaryOrDetail,
    }),
  sendConversationImage: (
    { token, companyId }: Ctx,
    conversationId: string,
    body: { base64: string; mimeType: string; filename?: string; caption?: string },
  ) =>
    backendFetch(`/messaging/conversations/${conversationId}/image`, {
      method: "POST",
      token,
      companyId,
      body,
    }),

  /* Contas */
  listAccounts: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/messaging/accounts${buildQuery(params)}`, {
      token,
      companyId,
      schema: messagingAccountListSchema,
    }),
  connectAccount: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/accounts/${id}/connect`, {
      method: "POST",
      token,
      companyId,
      schema: messagingAccountSchema,
    }),
  disconnectAccount: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/accounts/${id}/disconnect`, {
      method: "POST",
      token,
      companyId,
      schema: messagingAccountSchema,
    }),
  testAccount: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/messaging/accounts/${id}/test`, { method: "POST", token, companyId }),

  /* Mídia — SOMENTE metadados (storage MOCK; sem URL de download nesta fase). */
  getMedia: ({ token, companyId }: Ctx, mediaId: string) =>
    backendFetch(`/messaging/media/${mediaId}`, { token, companyId, schema: mediaResponseSchema }),
};
