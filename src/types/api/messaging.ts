import { z } from "zod";

/**
 * Contratos REAIS do módulo de messaging.
 *
 * Pontos que ditam a UI:
 * - Paginação é por CURSOR opaco (`{items, nextCursor, hasMore}`), não offset.
 * - A LISTA de conversas devolve o summary SEM `lastMessage` — não há preview na
 *   listagem; só o detalhe traz a última mensagem.
 * - A lista de mensagens expõe apenas `preview`; o conteúdo completo exige
 *   `GET /messaging/messages/:id`.
 * - Telefones de participantes chegam MASCARADOS do backend.
 * - Envio é assíncrono (202) e idempotente por `clientMessageId`.
 */

/* ---------- Enums reais ---------- */

export const conversationStatusSchema = z.enum([
  "OPEN",
  "PENDING",
  "RESOLVED",
  "ARCHIVED",
  "BLOCKED",
]);
export type ApiConversationStatus = z.infer<typeof conversationStatusSchema>;

export const conversationTypeSchema = z.enum(["DIRECT", "GROUP", "BROADCAST"]);
export type ApiConversationType = z.infer<typeof conversationTypeSchema>;

export const messageDirectionSchema = z.enum(["INBOUND", "OUTBOUND", "SYSTEM"]);
export type ApiMessageDirection = z.infer<typeof messageDirectionSchema>;

/** Enum do banco é mais amplo; `type` é lido como string para não quebrar. */
export const messageStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "QUEUED",
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
  "CANCELED",
  "RECEIVED",
]);
export type ApiMessageStatus = z.infer<typeof messageStatusSchema>;

/** Só estes tipos podem ser ENVIADOS (FUNCTIONAL_MESSAGE_TYPES do backend). */
export const sendableMessageTypes = ["TEXT", "IMAGE", "DOCUMENT"] as const;
export type SendableMessageType = (typeof sendableMessageTypes)[number];

export const messagingAccountStatusSchema = z.enum([
  "DRAFT",
  "CONNECTING",
  "CONNECTED",
  "DEGRADED",
  "DISCONNECTED",
  "ERROR",
  "REVOKED",
]);
export type ApiMessagingAccountStatus = z.infer<typeof messagingAccountStatusSchema>;

/* ---------- Envelope de cursor ---------- */

export function cursorResult<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}

/* ---------- Sendability (Fase 6.1/6.2) ---------- */

/** Vocabulário público estável de status (Fase 6.1). Nunca o enum interno. */
export const publicMessageStatusSchema = z.enum([
  "QUEUED",
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
]);
export type PublicMessageStatus = z.infer<typeof publicMessageStatusSchema>;

/**
 * Motivo de a conversa não poder enviar. `code` é estável/provider-agnóstico
 * (CONNECTION_*); `connectionStatus` é o status persistido da conexão. NUNCA
 * expõe connectionId/provider. Fonte da verdade da UI: `canSend` + este objeto.
 */
export const sendabilityReasonSchema = z.object({
  code: z.string(),
  retryable: z.boolean(),
  connectionStatus: z.string(),
});
export type ApiSendabilityReason = z.infer<typeof sendabilityReasonSchema>;

/* ---------- Conversas ---------- */

export const conversationSummarySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  messagingAccountId: z.string(),
  type: z.string(),
  status: z.string(),
  title: z.string().nullable(),
  assignedToUserId: z.string().nullable(),
  contactId: z.string().nullable(),
  unreadCount: z.number(),
  lastMessageAt: z.string().nullable(),
  lastInboundAt: z.string().nullable(),
  lastOutboundAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Fase 6.1: a conversa pode enviar? (derivado da conexão no backend).
  canSend: z.boolean(),
  sendabilityReason: sendabilityReasonSchema.nullable(),
});
export type ApiConversation = z.infer<typeof conversationSummarySchema>;
export const conversationListSchema = cursorResult(conversationSummarySchema);
export type ApiConversationList = z.infer<typeof conversationListSchema>;

/** `phone` já vem mascarado do backend (maskPhone). */
export const participantSchema = z.object({
  id: z.string(),
  type: z.string(),
  phone: z.string().nullable(),
  displayName: z.string().nullable(),
  contactId: z.string().nullable(),
  isAdmin: z.boolean(),
});
export type ApiParticipant = z.infer<typeof participantSchema>;

export const messageSummarySchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  messagingAccountId: z.string(),
  direction: z.string(),
  type: z.string(),
  status: z.string(),
  preview: z.string().nullable(),
  hasMedia: z.boolean(),
  mediaId: z.string().nullable(),
  // Fase 6.1: `externalMessageId` (providerMessageId) e `clientMessageId`
  // REMOVIDOS do contrato público — nunca expor identificadores de provider.
  replyToMessageId: z.string().nullable(),
  errorCode: z.string().nullable(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  readAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiMessage = z.infer<typeof messageSummarySchema>;
export const messageListSchema = cursorResult(messageSummarySchema);
export type ApiMessageList = z.infer<typeof messageListSchema>;

/* ---------- Mensagem PÚBLICA (histórico + resposta de envio, Fase 6.1) ---------- */

export const publicFailureSchema = z.object({
  code: z.string(),
  retryable: z.boolean(),
  message: z.string().nullable(),
});

/**
 * Shape sanitizado devolvido por `GET /conversations/:id/messages` e pela
 * resposta do envio conversation-scoped: `text` já decifrado (ou placeholder de
 * mídia/erro), `status` público e `failure` seguro. SEM externalMessageId,
 * clientMessageId, remoteJid, ciphertext ou dados de provider.
 */
export const publicMessageSchema = z.object({
  id: z.string(),
  direction: z.string(),
  type: z.string(),
  text: z.string().nullable(),
  status: publicMessageStatusSchema,
  createdAt: z.string(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  readAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  failure: publicFailureSchema.nullable(),
});
export type ApiPublicMessage = z.infer<typeof publicMessageSchema>;
export const publicMessageListSchema = cursorResult(publicMessageSchema);
export type ApiPublicMessageList = z.infer<typeof publicMessageListSchema>;

export const conversationDetailSchema = conversationSummarySchema.extend({
  participants: z.array(participantSchema),
  lastMessage: messageSummarySchema.nullable(),
});
export type ApiConversationDetail = z.infer<typeof conversationDetailSchema>;

/** Detalhe da mensagem: conteúdo decifrado (shape versionado do backend). */
export const messageDetailSchema = messageSummarySchema.extend({
  content: z.record(z.string(), z.unknown()).nullable(),
});
export type ApiMessageDetail = z.infer<typeof messageDetailSchema>;

/* ---------- Contas ---------- */

export const messagingAccountSchema = z
  .object({
    id: z.string(),
    connectionId: z.string(),
    provider: z.string(),
    name: z.string(),
    phoneNumber: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    status: z.string(),
    lastConnectedAt: z.string().nullable().optional(),
    lastDisconnectedAt: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type ApiMessagingAccount = z.infer<typeof messagingAccountSchema>;
/** A listagem de contas não usa cursor (é pequena). */
export const messagingAccountListSchema = z
  .object({ items: z.array(messagingAccountSchema) })
  .passthrough();

/* ---------- Filtros ---------- */

export interface ConversationFilters {
  cursor?: string;
  limit?: number;
  messagingAccountId?: string;
  status?: string;
  type?: string;
  assignedToUserId?: string;
  contactId?: string;
  unreadOnly?: boolean;
  search?: string;
  updatedFrom?: string;
  updatedTo?: string;
}

export interface MessageFilters {
  cursor?: string;
  limit?: number;
  direction?: string;
  type?: string;
  status?: string;
  before?: string;
  after?: string;
}

/** Corpo real de POST /messaging/messages (endpoint account-scoped legado). */
export interface SendMessageInput {
  messagingAccountId: string;
  to: string;
  type: SendableMessageType;
  content: Record<string, unknown>;
  clientMessageId: string;
  replyToMessageId?: string;
  contactId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Corpo do envio CONVERSATION-SCOPED da Inbox (Fase 6.1/6.2):
 * `POST /messaging/conversations/:id/messages`. Só texto; `clientMessageId` é a
 * chave de idempotência e existe SOMENTE no request (nunca na resposta pública).
 */
export interface SendConversationMessageInput {
  text: string;
  clientMessageId: string;
}
