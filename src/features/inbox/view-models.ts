import type {
  ApiConversation,
  ApiLabel,
  ApiLabelRef,
  ApiPublicMessageListItem,
  ApiSendabilityPublic,
  ApiDraft,
} from "@/types/api/messaging";
import type { RealtimeConnectionStatus } from "@/lib/messaging/realtime-connection";

/**
 * VIEW MODELS da Inbox (F0) — adaptadores PUROS de DTO da API → modelo de
 * apresentação. Componentes consomem view models (nunca o DTO cru gigante). Sem
 * React, sem fetch — testáveis isolados.
 */

/** Item da lista de conversas. Hierarquia: contato > preview > tempo > unread/status. */
export interface ConversationListItemVM {
  id: string;
  title: string;
  channel: string;
  accountLabel: string | null;
  preview: string | null;
  previewDirection: string | null;
  previewType: string | null;
  lastActivityAt: string | null;
  unread: number;
  status: string;
  assignedToUserId: string | null;
  ownerId: string | null;
  labels: LabelVM[];
  canSend: boolean;
  version: number;
}

export interface LabelVM {
  id: string;
  name: string;
  color: string;
}

export function toLabelVM(l: ApiLabelRef | ApiLabel): LabelVM {
  return { id: l.id, name: l.name, color: l.color };
}

/** Nome de exibição: título → contato (telefone) → "Conversa". */
export function conversationTitle(c: Pick<ApiConversation, "title" | "normalizedPhone">): string {
  return c.title || c.normalizedPhone || "Conversa";
}

export function toConversationListItem(c: ApiConversation): ConversationListItemVM {
  return {
    id: c.id,
    title: conversationTitle(c),
    channel: c.channel ?? "WHATSAPP",
    accountLabel: c.account?.label ?? null,
    preview: c.lastMessagePreview?.preview ?? null,
    previewDirection: c.lastMessagePreview?.direction ?? null,
    previewType: c.lastMessagePreview?.type ?? null,
    lastActivityAt: c.lastMessageAt ?? c.updatedAt,
    // Unread por usuário quando disponível; senão cai no global (legado).
    unread: c.unreadForUser ?? c.unreadCount,
    status: c.status,
    assignedToUserId: c.assignedToUserId,
    ownerId: c.ownerId ?? null,
    labels: (c.labels ?? []).map(toLabelVM),
    canSend: c.canSend,
    version: c.version ?? 0,
  };
}

/** Classificação de uma mensagem na timeline. */
export type TimelineMessageKind = "public" | "internal" | "system";

export interface TimelineMessageVM {
  id: string;
  kind: TimelineMessageKind;
  direction: string;
  text: string | null;
  status: string;
  createdAt: string;
  replyToMessageId: string | null;
  senderUserId: string | null;
  hasMedia: boolean;
  failure: ApiPublicMessageListItem["failure"];
  /** Falha terminal → oferecer retry. */
  isFailed: boolean;
}

export function messageKind(m: {
  direction: string;
  visibility?: string;
}): TimelineMessageKind {
  if (m.visibility === "INTERNAL") return "internal";
  if (m.direction === "SYSTEM") return "system";
  return "public";
}

export function toTimelineMessage(m: ApiPublicMessageListItem): TimelineMessageVM {
  return {
    id: m.id,
    kind: messageKind(m),
    direction: m.direction,
    text: m.text,
    status: m.status,
    createdAt: m.createdAt,
    replyToMessageId: m.replyToMessageId ?? null,
    senderUserId: m.senderUserId ?? null,
    hasMedia: m.hasMedia ?? false,
    failure: m.failure,
    isFailed: m.status === "FAILED",
  };
}

/** Estado de "posso enviar?" para o composer. */
export interface SendabilityVM {
  canSend: boolean;
  reasonCode: string | null;
  requiresTemplate: boolean;
  withinReplyWindow: boolean;
  replyWindowExpiresAt: string | null;
  allowedMessageTypes: string[];
}

export function toSendabilityVM(
  detail: ApiSendabilityPublic | null | undefined,
  fallbackCanSend: boolean,
): SendabilityVM {
  if (!detail) {
    return {
      canSend: fallbackCanSend,
      reasonCode: null,
      requiresTemplate: false,
      withinReplyWindow: true,
      replyWindowExpiresAt: null,
      allowedMessageTypes: [],
    };
  }
  return {
    canSend: detail.canSend,
    reasonCode: detail.reasonCode,
    requiresTemplate: detail.requiresTemplate,
    withinReplyWindow: detail.replyWindow.withinWindow,
    replyWindowExpiresAt: detail.replyWindow.expiresAt,
    allowedMessageTypes: detail.allowedMessageTypes,
  };
}

/** Estado do rascunho para o composer (dirty local vs remoto). */
export interface DraftVM {
  text: string;
  version: number;
  updatedAt: string | null;
  hasRemote: boolean;
}

export function toDraftVM(d: ApiDraft | null | undefined): DraftVM {
  return {
    text: d?.text ?? "",
    version: d?.version ?? 0,
    updatedAt: d?.updatedAt ?? null,
    hasRemote: Boolean(d),
  };
}

/** Rótulo humano (curto) do estado de conexão realtime para a UI. */
export function connectionLabel(status: RealtimeConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Conectado";
    case "connecting":
      return "Conectando…";
    case "reconnecting":
      return "Reconectando…";
    case "offline":
      return "Offline";
    case "error":
      return "Sem tempo real";
    default:
      return "";
  }
}

/** A UI deve sinalizar o estado de conexão de forma visível? (connected fica discreto.) */
export function shouldSurfaceConnection(status: RealtimeConnectionStatus): boolean {
  return status === "reconnecting" || status === "offline" || status === "error";
}
