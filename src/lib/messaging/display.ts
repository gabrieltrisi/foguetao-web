import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type { ApiConversation, ApiMessage, ApiParticipant } from "@/types/api/messaging";

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

/* ---------- Identidade da conversa ---------- */

/**
 * Nome exibido. O summary NÃO traz nome de contato nem telefone — só `title` e
 * `contactId`. Resolvemos o contato quando o nome é conhecido; senão usamos o
 * título; senão um rótulo honesto por tipo.
 */
export function conversationName(
  c: Pick<ApiConversation, "title" | "contactId" | "type">,
  contactName?: string | null,
): string {
  if (contactName) return contactName;
  if (c.title) return c.title;
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
  c: Pick<ApiConversation, "title" | "contactId" | "type">,
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
