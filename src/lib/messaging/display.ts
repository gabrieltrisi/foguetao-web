import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type {
  ApiConversation,
  ApiMessage,
  ApiParticipant,
  ApiSendabilityReason,
  PublicMessageStatus,
} from "@/types/api/messaging";

type Tone = NonNullable<BadgeProps["tone"]>;

/**
 * Apresentação de messaging.
 *
 * Os tipos antigos da UI eram pré-formatados (`time: "10:42"`). O contrato traz
 * ISO e ids; toda a tradução vive aqui. Nada é inventado: o que o contrato não
 * tem (presença/online, etiquetas) simplesmente não é exibido.
 */

/* ---------- Status ---------- */

export const conversationStatusMeta: Record<string, { label: string; tone: Tone }> = {
  OPEN: { label: "Aberta", tone: "success" },
  PENDING: { label: "Pendente", tone: "warning" },
  RESOLVED: { label: "Resolvida", tone: "info" },
  ARCHIVED: { label: "Arquivada", tone: "neutral" },
  BLOCKED: { label: "Bloqueada", tone: "danger" },
};

export function statusMeta(status: string): { label: string; tone: Tone } {
  return conversationStatusMeta[status] ?? { label: status, tone: "neutral" };
}

export const messageStatusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Pendente",
  QUEUED: "Na fila",
  SENDING: "Enviando",
  SENT: "Enviada",
  DELIVERED: "Entregue",
  READ: "Lida",
  FAILED: "Falhou",
  CANCELED: "Cancelada",
  RECEIVED: "Recebida",
};

/** Só estes status permitem cancelar (regra do backend). */
export function isCancelable(status: string): boolean {
  return status === "PENDING" || status === "QUEUED";
}

/** Mensagem que ainda não saiu — usado para o estado "enviando". */
export function isPendingSend(status: string): boolean {
  return ["DRAFT", "PENDING", "QUEUED", "SENDING"].includes(status);
}

export function isFailed(status: string): boolean {
  return status === "FAILED";
}

/* ---------- Status PÚBLICO (Fase 6.1) ---------- */

/**
 * Único ponto de apresentação do status público (QUEUED/SENDING/SENT/DELIVERED/
 * READ/FAILED). Nenhum componente conhece o enum interno. `tone` alimenta badges/
 * cores; a UI decide o ícone da biblioteca instalada (lucide) a partir de `icon`.
 */
export type PublicStatusIcon = "clock" | "loader" | "check" | "check-check" | "eye" | "alert";

export const publicStatusMeta: Record<
  PublicMessageStatus,
  { label: string; tone: Tone; icon: PublicStatusIcon }
> = {
  QUEUED: { label: "Na fila", tone: "neutral", icon: "clock" },
  SENDING: { label: "Enviando", tone: "info", icon: "loader" },
  SENT: { label: "Enviada", tone: "info", icon: "check" },
  DELIVERED: { label: "Entregue", tone: "success", icon: "check-check" },
  READ: { label: "Lida", tone: "success", icon: "eye" },
  FAILED: { label: "Falhou", tone: "danger", icon: "alert" },
  CANCELED: { label: "Cancelada", tone: "neutral", icon: "alert" },
};

export function publicStatus(status: string): {
  label: string;
  tone: Tone;
  icon: PublicStatusIcon;
} {
  return publicStatusMeta[status as PublicMessageStatus] ?? publicStatusMeta.QUEUED;
}

/* ---------- Sendability (Fase 6.1/6.2) ---------- */

/** Frase humana por code de sendability. Componentes NUNCA veem CONNECTION_*. */
const SENDABILITY_MESSAGE: Record<string, string> = {
  CONNECTION_CONNECTING: "Conexão em andamento. Aguarde alguns instantes.",
  CONNECTION_AWAITING_QR: "A conta precisa ser conectada antes de enviar mensagens.",
  CONNECTION_NOT_READY: "A conta precisa ser conectada antes de enviar mensagens.",
  CONNECTION_DISCONNECTED: "A conta está desconectada no momento.",
  CONNECTION_DEGRADED: "A conexão está instável. Tente novamente mais tarde.",
  CONNECTION_FAILED: "Não foi possível utilizar esta conexão.",
  CONNECTION_REVOKED: "A sessão foi revogada e precisa ser configurada novamente.",
  CONNECTION_DISABLED: "Esta conexão está desativada.",
  CONNECTION_NOT_SENDABLE: "Esta conexão não permite envio no momento.",
};

/** Rótulo curto por code (cabeçalho/lista). */
const SENDABILITY_LABEL: Record<string, string> = {
  CONNECTION_CONNECTING: "Conectando",
  CONNECTION_AWAITING_QR: "Aguardando conexão",
  CONNECTION_NOT_READY: "Aguardando conexão",
  CONNECTION_DISCONNECTED: "Desconectado",
  CONNECTION_DEGRADED: "Conexão instável",
  CONNECTION_FAILED: "Falha de conexão",
  CONNECTION_REVOKED: "Sessão revogada",
  CONNECTION_DISABLED: "Conexão desativada",
  CONNECTION_NOT_SENDABLE: "Indisponível",
};

export interface SendabilityView {
  canSend: boolean;
  /** Rótulo curto para header/lista. */
  label: string;
  /** Frase humana (sem código técnico). */
  message: string;
  tone: Tone;
}

/**
 * Traduz `canSend` + `sendabilityReason` para a UI. Fonte da verdade é o backend
 * (nunca inferir por provider). `retryable` NÃO é exposto como palavra técnica.
 */
export function sendability(
  canSend: boolean,
  reason: ApiSendabilityReason | null,
): SendabilityView {
  if (canSend || !reason) {
    return { canSend: true, label: "Disponível para envio", message: "", tone: "success" };
  }
  const code = reason.code;
  return {
    canSend: false,
    label: SENDABILITY_LABEL[code] ?? "Indisponível",
    message: SENDABILITY_MESSAGE[code] ?? "Esta conexão não permite envio no momento.",
    tone: reason.retryable ? "warning" : "danger",
  };
}

/* ---------- Identidade da conversa ---------- */

/**
 * Formata um telefone normalizado (só dígitos, com DDI) para exibição completa.
 * BR celular (55 + DDD + 9 dígitos) → "+55 71 98123-0869"; fixo (55 + DDD + 8) →
 * "+55 71 3216-5498". Qualquer outro formato: "+<dígitos>" sem inventar grupos.
 */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("55") && (d.length === 13 || d.length === 12)) {
    const ddd = d.slice(2, 4);
    const rest = d.slice(4);
    const mid = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
    const end = rest.length === 9 ? rest.slice(5) : rest.slice(4);
    return `+55 ${ddd} ${mid}-${end}`;
  }
  return `+${d}`;
}

/**
 * Nome exibido. O summary traz `title`, `contactId` e `normalizedPhone`.
 * Resolvemos o contato quando o nome é conhecido; senão o título; senão o
 * telefone completo do interlocutor; senão um rótulo honesto por tipo.
 */
export function conversationName(
  c: Pick<ApiConversation, "title" | "contactId" | "type" | "normalizedPhone">,
  contactName?: string | null,
): string {
  if (contactName) return contactName;
  if (c.title) return c.title;
  if (c.normalizedPhone) return formatPhone(c.normalizedPhone);
  if (c.type === "GROUP") return "Grupo sem título";
  if (c.type === "BROADCAST") return "Transmissão";
  return "Conversa sem título";
}

/** Nome do participante: displayName ou telefone MASCARADO (vem do backend). */
export function participantName(p: ApiParticipant): string {
  return p.displayName || p.phone || "Participante";
}

/**
 * Título do chat, do mais informativo para o menos: nome do participante →
 * título da conversa → telefone (mascarado) → rótulo por tipo. Um telefone
 * nunca ganha de um nome real.
 */
export function chatTitle(
  c: Pick<ApiConversation, "title" | "contactId" | "type" | "normalizedPhone">,
  counterpart?: ApiParticipant,
): string {
  if (counterpart?.displayName) return counterpart.displayName;
  if (c.title) return c.title;
  if (counterpart?.phone) return counterpart.phone;
  return conversationName(c, null);
}

/* ---------- Datas ---------- */

/**
 * Horário no estilo de lista de conversas: hoje → "10:42"; ontem → "Ontem";
 * últimos 7 dias → dia da semana; senão → data curta.
 */
export function conversationTime(iso: string | null, now: Date = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86_400_000);

  if (diffDays <= 0) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) {
    return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Hora da mensagem no balão. */
export function messageTime(m: Pick<ApiMessage, "createdAt" | "sentAt" | "receivedAt">): string {
  const iso = m.sentAt ?? m.receivedAt ?? m.createdAt;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Separador de dia na thread ("Hoje", "Ontem", data). */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ---------- Thread ---------- */

/**
 * A listagem vem do mais recente para o mais antigo (cursor DESC); a thread
 * exibe em ordem cronológica.
 */
export function toChronological<T extends { createdAt: string }>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/** Agrupa a thread por dia, preservando a ordem cronológica. */
export function groupByDay<T extends { createdAt: string }>(
  items: readonly T[],
  now: Date = new Date(),
): { day: string; items: T[] }[] {
  const groups: { day: string; items: T[] }[] = [];
  for (const item of toChronological(items)) {
    const day = dayLabel(item.createdAt, now);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

/* ---------- Contas ---------- */

export const accountStatusMeta: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Rascunho", tone: "neutral" },
  CONNECTING: { label: "Conectando", tone: "info" },
  CONNECTED: { label: "Conectada", tone: "success" },
  DEGRADED: { label: "Instável", tone: "warning" },
  DISCONNECTED: { label: "Desconectada", tone: "neutral" },
  ERROR: { label: "Erro", tone: "danger" },
  REVOKED: { label: "Revogada", tone: "danger" },
};

export function accountMeta(status: string): { label: string; tone: Tone } {
  return accountStatusMeta[status] ?? { label: status, tone: "neutral" };
}

export function isConnected(status: string): boolean {
  return status === "CONNECTED";
}

/* ---------- Idempotência ---------- */

/**
 * `clientMessageId` do contrato: chave de idempotência, formato
 * /^[a-zA-Z0-9._:-]+$/ e até 200 chars. Reenviar o MESMO id com o MESMO
 * conteúdo devolve a mesma mensagem; com conteúdo diferente, o backend dá 409.
 */
export function newClientMessageId(now: number, random: number = Math.random()): string {
  const rand = random.toString(36).slice(2, 10);
  return `web-${now.toString(36)}-${rand}`;
}

/* ---------- Erros ---------- */

/** Mensagens dos ErrorCodes REAIS do módulo. */
export function messageForMessagingError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "CONVERSATION_NOT_FOUND":
        return "Conversa não encontrada.";
      case "CONVERSATION_ARCHIVED":
        return "Esta conversa está arquivada.";
      case "CONVERSATION_ASSIGNMENT_INVALID":
        return "Responsável inválido para esta empresa.";
      case "MESSAGE_NOT_FOUND":
        return "Mensagem não encontrada.";
      case "MESSAGE_TYPE_UNSUPPORTED":
        return "Tipo de mensagem não suportado.";
      case "MESSAGE_CONTENT_INVALID":
        return "Conteúdo da mensagem inválido.";
      case "MESSAGE_IDEMPOTENCY_CONFLICT":
        return "Esta mensagem já foi enviada com outro conteúdo.";
      case "MESSAGE_RECIPIENT_INVALID":
        return "Destinatário inválido.";
      case "MESSAGE_REPLY_INVALID":
        return "Só é possível responder a uma mensagem da mesma conversa.";
      case "MESSAGE_CANCEL_NOT_POSSIBLE":
        return "Esta mensagem não pode mais ser cancelada.";
      case "MESSAGING_ACCOUNT_NOT_FOUND":
        return "Conta de mensageria não encontrada.";
      case "MESSAGING_ACCOUNT_INACTIVE":
        return "A conta de mensageria não está conectada.";
      case "MESSAGING_PROVIDER_UNSUPPORTED":
        return "Provedor não suportado.";
      case "MEDIA_NOT_FOUND":
        return "Mídia não encontrada.";
      case "MEDIA_TYPE_UNSUPPORTED":
        return "Tipo de arquivo não suportado.";
      case "MEDIA_TOO_LARGE":
        return "Arquivo muito grande.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "VALIDATION_ERROR":
        return error.message || "Dados inválidos.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}

/* ---------- Erros de ENVIO conversation-scoped (Fase 6.2) ---------- */

/** Mensagem humana por status HTTP do envio (400/404/409/422/429/5xx). */
export function messageForSendError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.statusCode) {
      case 400:
        return "Revise o conteúdo da mensagem.";
      case 404:
        return "Esta conversa não está mais disponível.";
      case 409:
        return "A conexão está temporariamente indisponível. Tente novamente em instantes.";
      case 422:
        return "Esta conexão precisa ser configurada antes de enviar novas mensagens.";
      case 429:
        return "Muitas tentativas. Aguarde um momento.";
      default:
        if (error.statusCode >= 500 || error.statusCode === 0) {
          return "Não foi possível enviar a mensagem agora.";
        }
        return messageForMessagingError(error);
    }
  }
  return "Não foi possível enviar a mensagem agora.";
}

/**
 * Extrai `{ retryable, connectionStatus }` do `details` de um 409/422
 * (CONNECTION_NOT_SENDABLE) para atualizar a sendability local — sem expor
 * detalhe técnico ao usuário.
 */
export function sendabilityFromError(
  error: unknown,
): { retryable: boolean; connectionStatus: string } | null {
  if (isApiError(error) && (error.statusCode === 409 || error.statusCode === 422)) {
    const d = error.details?.[0] as
      | { retryable?: unknown; connectionStatus?: unknown }
      | undefined;
    if (d && typeof d.retryable === "boolean" && typeof d.connectionStatus === "string") {
      return { retryable: d.retryable, connectionStatus: d.connectionStatus };
    }
  }
  return null;
}
