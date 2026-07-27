import type { InfiniteData } from "@tanstack/react-query";
import type { ApiPublicFailure, ApiPublicMessageListItem } from "@/types/api/messaging";

/**
 * Reconciliação de MENSAGENS OTIMISTAS (F2C) — puro/testável, sem React.
 *
 * O envio insere imediatamente uma mensagem local (`temp:<clientMessageId>`,
 * status SENDING). Quando o servidor responde (ou o eco `message.created` chega
 * por SSE), a mensagem temporária é substituída pela real (id do servidor). Como o
 * DTO público NÃO expõe `clientMessageId`, a correlação otimista↔real é feita:
 *  - no PRÓPRIO envio, pelo `tempId` guardado no contexto da mutação;
 *  - no eco por SSE, colapsando qualquer temp OUTBOUND não-terminal de MESMO texto.
 *
 * `flattenTimelinePages` deduplica por `id` e ordena por (createdAt, id); o temp
 * usa `createdAt = agora` → entra no fim (mais recente). Todas as funções são
 * idempotentes: reaplicar não duplica nem regride.
 */

export const TEMP_PREFIX = "temp:";

export const tempIdFor = (clientMessageId: string): string => `${TEMP_PREFIX}${clientMessageId}`;
export const isTempId = (id: string): boolean => id.startsWith(TEMP_PREFIX);
export const clientMessageIdFromTempId = (id: string): string | null =>
  id.startsWith(TEMP_PREFIX) ? id.slice(TEMP_PREFIX.length) : null;

/** Status locais ainda "em voo" — elegíveis a colapso/substituição pelo real. */
const PENDING_STATUS = new Set(["QUEUED", "SENDING"]);

type Page = { items: ApiPublicMessageListItem[]; nextCursor: string | null; hasMore: boolean };
type MsgData = InfiniteData<Page> | undefined;

/**
 * Monta a mensagem otimista (formato de item de timeline). Só TEXTO/OUTBOUND nesta
 * sprint (mídia/reply otimistas ficam para quando houver composer definitivo).
 */
export function buildOptimisticMessage(input: {
  clientMessageId: string;
  text: string;
  senderUserId: string | null;
  createdAt: string;
}): ApiPublicMessageListItem {
  return {
    id: tempIdFor(input.clientMessageId),
    direction: "OUTBOUND",
    type: "TEXT",
    text: input.text,
    status: "SENDING",
    createdAt: input.createdAt,
    scheduledAt: null,
    sentAt: null,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    visibility: "PUBLIC",
    replyToMessageId: null,
    mediaId: null,
    hasMedia: false,
    senderUserId: input.senderUserId,
  };
}

/**
 * Insere/atualiza uma mensagem no TOPO da página mais recente (o contrato pagina do
 * mais novo para o mais antigo). Idempotente por `id`: se já existir, é substituída.
 * Se o cache ainda não tem páginas, não faz nada (não há timeline aberta).
 */
export function upsertMessage(data: MsgData, message: ApiPublicMessageListItem): MsgData {
  if (!data || data.pages.length === 0) return data;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((m) => m.id !== message.id),
  }));
  pages[0] = { ...pages[0], items: [message, ...pages[0].items] };
  return { ...data, pages };
}

/**
 * Substitui a temp pela mensagem REAL do servidor. Remove: (1) a própria real (para
 * reinserir no topo sem duplicar); (2) o `tempId` explícito do contexto da mutação;
 * (3) o eco por SSE — qualquer temp OUTBOUND ainda pendente com o MESMO texto (o
 * payload SSE não traz clientMessageId). Depois insere a real por id (idempotente).
 */
export function reconcileServerMessage(
  data: MsgData,
  serverMessage: ApiPublicMessageListItem,
  tempId?: string,
): MsgData {
  if (!data || data.pages.length === 0) return data;
  const collapseEcho = serverMessage.direction === "OUTBOUND";
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((m) => {
      if (m.id === serverMessage.id) return false;
      if (tempId && m.id === tempId) return false;
      if (
        collapseEcho &&
        isTempId(m.id) &&
        PENDING_STATUS.has(m.status) &&
        m.text === serverMessage.text
      ) {
        return false;
      }
      return true;
    }),
  }));
  pages[0] = { ...pages[0], items: [serverMessage, ...pages[0].items] };
  return { ...data, pages };
}

/**
 * Marca a temp como FAILED preservando texto/posição para retry. Não remove a
 * mensagem (o texto do usuário nunca se perde). Idempotente.
 */
export function markTempFailed(data: MsgData, tempId: string, failure: ApiPublicFailure): MsgData {
  if (!data) return data;
  let changed = false;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.map((m): ApiPublicMessageListItem => {
      if (m.id !== tempId) return m;
      changed = true;
      return { ...m, status: "FAILED", failure };
    }),
  }));
  return changed ? { ...data, pages } : data;
}

/** Failure sintética para falha de rede/local (o servidor não respondeu). */
export function localSendFailure(message: string): ApiPublicFailure {
  return { code: "LOCAL_SEND_FAILED", retryable: true, message };
}
