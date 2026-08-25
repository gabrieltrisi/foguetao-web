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
 * Nota interna OTIMISTA (F3) — mesma base, porém `visibility=INTERNAL` (renderiza como
 * nota, nunca como bolha pública). O endpoint de nota é síncrono; o `clientMessageId`
 * é só local (o backend não o usa) e serve para o `tempId` da reconciliação.
 */
export function buildOptimisticNote(input: {
  clientMessageId: string;
  text: string;
  senderUserId: string | null;
  createdAt: string;
}): ApiPublicMessageListItem {
  return { ...buildOptimisticMessage(input), visibility: "INTERNAL" };
}

/**
 * Item final da nota a partir da resposta do servidor (`messageSummary` traz `id`/
 * timestamps/status, mas NÃO `text`/`visibility`) + o texto LOCAL (autoritativo — o
 * que o usuário digitou) + o autor local. Mantém `visibility=INTERNAL`.
 */
export function buildReconciledNote(input: {
  id: string;
  text: string;
  senderUserId: string | null;
  createdAt: string;
  sentAt: string | null;
  status: string;
  replyToMessageId: string | null;
}): ApiPublicMessageListItem {
  return {
    id: input.id,
    direction: "OUTBOUND",
    type: "TEXT",
    text: input.text,
    status: input.status as ApiPublicMessageListItem["status"],
    createdAt: input.createdAt,
    scheduledAt: null,
    sentAt: input.sentAt,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    visibility: "INTERNAL",
    replyToMessageId: input.replyToMessageId,
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
 * Substitui a temp pela mensagem REAL do servidor. Localiza UMA temp a substituir:
 * (a) o `tempId` explícito do contexto da mutação; ou (b) no eco por SSE (sem
 * tempId), a PRIMEIRA temp OUTBOUND ainda pendente de MESMO texto (o payload SSE
 * não traz clientMessageId). Colapsa só ESSA (evita sumir a 2ª de textos iguais) e
 * **preserva o `senderUserId`** da temp — o DTO público não expõe `senderUserId`,
 * então sem isso o grupo/rótulo ("Você") piscaria a cada envio. Depois insere a real
 * por id (idempotente; nunca duplica).
 */
export function reconcileServerMessage(
  data: MsgData,
  serverMessage: ApiPublicMessageListItem,
  tempId?: string,
): MsgData {
  if (!data || data.pages.length === 0) return data;
  const collapseEcho = serverMessage.direction === "OUTBOUND" && !tempId;
  const matchesTemp = (m: ApiPublicMessageListItem): boolean => {
    if (m.id === serverMessage.id) return false;
    if (tempId) return m.id === tempId;
    return collapseEcho && isTempId(m.id) && PENDING_STATUS.has(m.status) && m.text === serverMessage.text;
  };

  // Localiza a temp a substituir E qualquer cópia REAL prévia do mesmo id (para herdar
  // campos que o payload público não traz — `senderUserId`/`visibility`).
  let replaced: ApiPublicMessageListItem | undefined;
  let existing: ApiPublicMessageListItem | undefined;
  for (const page of data.pages) {
    for (const m of page.items) {
      if (!replaced && matchesTemp(m)) replaced = m;
      if (!existing && m.id === serverMessage.id) existing = m;
    }
    if (replaced && existing) break;
  }

  // Herança defensiva: o DTO público NÃO expõe `senderUserId` nem `visibility`. Sem
  // isto, o eco por SSE (ou o 202) apagaria o autor (rótulo "Você" piscaria) e — pior —
  // REBAIXARIA uma NOTA INTERNA a pública (vazamento visual). Herda da temp/cópia real.
  const inherit = replaced ?? existing;
  const merged: ApiPublicMessageListItem = {
    ...serverMessage,
    senderUserId: serverMessage.senderUserId ?? inherit?.senderUserId ?? null,
    visibility: serverMessage.visibility ?? inherit?.visibility,
  };

  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((m) => m.id !== serverMessage.id && m.id !== replaced?.id),
  }));
  pages[0] = { ...pages[0], items: [merged, ...pages[0].items] };
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

/**
 * Remove a temp do cache (falha de NOTA interna: a nota não renderiza estado "falhou"
 * nem retry, então é removida para não deixar uma nota fantasma). Idempotente.
 */
export function removeTemp(data: MsgData, tempId: string): MsgData {
  if (!data) return data;
  let changed = false;
  const pages = data.pages.map((page) => {
    const items = page.items.filter((m) => m.id !== tempId);
    if (items.length !== page.items.length) changed = true;
    return { ...page, items };
  });
  return changed ? { ...data, pages } : data;
}

/** Failure sintética para falha de rede/local (o servidor não respondeu). */
export function localSendFailure(message: string): ApiPublicFailure {
  return { code: "LOCAL_SEND_FAILED", retryable: true, message };
}
