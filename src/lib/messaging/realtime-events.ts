import { z } from "zod";
import {
  publicFailureSchema,
  publicMessageSchema,
  publicMessageStatusSchema,
} from "@/types/api/messaging";

/**
 * Contrato dos eventos realtime NO CLIENTE (Fase 6.3C). Espelha o envelope da
 * Fase 6.3A/6.3B (mesmos nomes/campos). Como o frontend não compartilha package
 * com o backend, ESTE schema é uma duplicação contratual inevitável — mantido
 * campo a campo idêntico e reutilizando os schemas dos DTOs públicos já usados
 * pela Inbox (`publicMessageSchema` etc.) para não divergir.
 */

export const REALTIME_EVENT_VERSION = 1 as const;

export const REALTIME_EVENT_TYPES = {
  MESSAGE_CREATED: "message.created",
  MESSAGE_STATUS_CHANGED: "message.statusChanged",
  CONVERSATION_UPDATED: "conversation.updated",
  CONVERSATION_READ: "conversation.read",
  // Inbox operacional (C3.1B/C/D) — eventos dedicados, união aditiva. SEM PII/conteúdo.
  CONVERSATION_ASSIGNED: "conversation.assigned",
  CONVERSATION_UNASSIGNED: "conversation.unassigned",
  CONVERSATION_OWNER_CHANGED: "conversation.ownerChanged",
  CONVERSATION_LABELED: "conversation.labeled",
  CONVERSATION_CLOSED: "conversation.closed",
  CONVERSATION_REOPENED: "conversation.reopened",
  DRAFT_SAVED: "draft.saved",
  DRAFT_DELETED: "draft.deleted",
  ACCOUNT_UPDATED: "account.updated",
  // Campanhas (Sprint C2B) — operacionais, sem PII (só id + contadores).
  CAMPAIGN_STARTED: "campaign.started",
  CAMPAIGN_PROGRESS: "campaign.progress",
  CAMPAIGN_PAUSED: "campaign.paused",
  CAMPAIGN_RESUMED: "campaign.resumed",
  CAMPAIGN_COMPLETED: "campaign.completed",
  CAMPAIGN_CANCELED: "campaign.canceled",
  CAMPAIGN_FAILED: "campaign.failed",
  CAMPAIGN_METRICS_UPDATED: "campaign.metrics.updated",
} as const;
export type RealtimeEventType = (typeof REALTIME_EVENT_TYPES)[keyof typeof REALTIME_EVENT_TYPES];

const base = {
  id: z.string().min(1),
  version: z.literal(1),
  companyId: z.string().min(1),
  occurredAt: z.string(),
};

const messageCreatedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.MESSAGE_CREATED),
  data: z.object({ conversationId: z.string(), message: publicMessageSchema }),
});

const messageStatusChangedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.MESSAGE_STATUS_CHANGED),
  data: z.object({
    conversationId: z.string(),
    messageId: z.string(),
    status: publicMessageStatusSchema,
    updatedAt: z.string(),
    failure: publicFailureSchema.nullable().optional(),
  }),
});

const conversationUpdatedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_UPDATED),
  data: z.object({
    conversationId: z.string(),
    reason: z.enum(["MESSAGE_CREATED", "ASSIGNED", "STATUS_CHANGED", "LAST_ACTIVITY_CHANGED"]),
    updatedAt: z.string(),
  }),
});

const conversationReadSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_READ),
  // C3.1B: coexistem o legado global (`unreadCount:0`) e a leitura POR USUÁRIO
  // (`userId` + `lastReadMessageId`). Todos opcionais → aceita ambas as formas.
  data: z.object({
    conversationId: z.string(),
    unreadCount: z.literal(0).optional(),
    userId: z.string().optional(),
    lastReadMessageId: z.string().nullable().optional(),
    updatedAt: z.string(),
  }),
});

/* ---------- Inbox operacional (C3.1B/C/D) ---------- */

const conversationAssignedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_ASSIGNED),
  data: z.object({ conversationId: z.string(), assignedToUserId: z.string().nullable() }),
});

const conversationUnassignedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_UNASSIGNED),
  data: z.object({ conversationId: z.string() }),
});

const conversationOwnerChangedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_OWNER_CHANGED),
  data: z.object({ conversationId: z.string(), ownerId: z.string().nullable() }),
});

const conversationLabeledSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.CONVERSATION_LABELED),
  data: z.object({ conversationId: z.string(), labelId: z.string(), added: z.boolean() }),
});

const conversationLifecycleSchema = <T extends string>(type: T) =>
  z.object({ ...base, type: z.literal(type), data: z.object({ conversationId: z.string(), at: z.string() }) });

const draftSavedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.DRAFT_SAVED),
  data: z.object({ conversationId: z.string(), userId: z.string(), updatedAt: z.string() }),
});

const draftDeletedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.DRAFT_DELETED),
  data: z.object({ conversationId: z.string(), userId: z.string() }),
});

const accountUpdatedSchema = z.object({
  ...base,
  type: z.literal(REALTIME_EVENT_TYPES.ACCOUNT_UPDATED),
  data: z.object({ accountId: z.string(), status: z.string(), at: z.string() }),
});

/* ---------- Campanhas (Sprint C2B) ---------- */

const campaignLifecycleData = z.object({
  campaignId: z.string(),
  status: z.string(),
  at: z.string(),
});
const campaignMetricsData = z.object({
  campaignId: z.string(),
  eligible: z.number(),
  processed: z.number(),
  progressPercentage: z.number(),
  sent: z.number(),
  delivered: z.number(),
  read: z.number(),
  failed: z.number(),
});
const campaignLifecycleSchema = <T extends string>(type: T) =>
  z.object({ ...base, type: z.literal(type), data: campaignLifecycleData });
const campaignMetricsSchema = <T extends string>(type: T) =>
  z.object({ ...base, type: z.literal(type), data: campaignMetricsData });

export const realtimeEnvelopeSchema = z.discriminatedUnion("type", [
  messageCreatedSchema,
  messageStatusChangedSchema,
  conversationUpdatedSchema,
  conversationReadSchema,
  conversationAssignedSchema,
  conversationUnassignedSchema,
  conversationOwnerChangedSchema,
  conversationLabeledSchema,
  conversationLifecycleSchema(REALTIME_EVENT_TYPES.CONVERSATION_CLOSED),
  conversationLifecycleSchema(REALTIME_EVENT_TYPES.CONVERSATION_REOPENED),
  draftSavedSchema,
  draftDeletedSchema,
  accountUpdatedSchema,
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_STARTED),
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_PAUSED),
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_RESUMED),
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_COMPLETED),
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_CANCELED),
  campaignLifecycleSchema(REALTIME_EVENT_TYPES.CAMPAIGN_FAILED),
  campaignMetricsSchema(REALTIME_EVENT_TYPES.CAMPAIGN_PROGRESS),
  campaignMetricsSchema(REALTIME_EVENT_TYPES.CAMPAIGN_METRICS_UPDATED),
]);

export type RealtimeEvent = z.infer<typeof realtimeEnvelopeSchema>;
export type MessageCreatedEvent = z.infer<typeof messageCreatedSchema>;
export type MessageStatusChangedEvent = z.infer<typeof messageStatusChangedSchema>;
export type ConversationUpdatedEvent = z.infer<typeof conversationUpdatedSchema>;
export type ConversationReadEvent = z.infer<typeof conversationReadSchema>;

/**
 * Faz parse+validação de um frame SSE. Nunca confia cegamente no JSON: retorna o
 * evento tipado ou `null` (JSON inválido / envelope fora do contrato). O chamador
 * ignora o `null` sem tocar no cache e sem derrubar a conexão.
 */
export function parseRealtimeEnvelope(raw: string): RealtimeEvent | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = realtimeEnvelopeSchema.safeParse(json);
  return result.success ? result.data : null;
}

/**
 * Ordem de progressão dos status PÚBLICOS. Usada só para impedir que um evento
 * FORA DE ORDEM regrida o status no cache — não é uma máquina de estados nova
 * (o backend é a fonte da verdade das transições).
 */
const STATUS_RANK: Record<string, number> = {
  QUEUED: 0,
  SENDING: 1,
  SENT: 2,
  DELIVERED: 3,
  READ: 4,
};

/**
 * O `next` deve ser aplicado sobre o `current`? Só avança na régua; `FAILED` é
 * terminal-lateral e só se aplica a partir de estados pré-entrega (nunca regride
 * DELIVERED/READ para FAILED).
 */
export function shouldApplyStatus(current: string, next: string): boolean {
  if (next === current) return false;
  if (next === "FAILED") {
    return current === "QUEUED" || current === "SENDING" || current === "SENT";
  }
  return (STATUS_RANK[next] ?? -1) > (STATUS_RANK[current] ?? -1);
}
