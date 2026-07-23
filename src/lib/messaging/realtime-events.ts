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
  data: z.object({
    conversationId: z.string(),
    unreadCount: z.literal(0),
    updatedAt: z.string(),
  }),
});

export const realtimeEnvelopeSchema = z.discriminatedUnion("type", [
  messageCreatedSchema,
  messageStatusChangedSchema,
  conversationUpdatedSchema,
  conversationReadSchema,
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
