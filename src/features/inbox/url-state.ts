import type { ConversationFilters } from "@/types/api/messaging";

/**
 * Estado da Inbox serializado na URL (F1). A URL é a FONTE da seleção e dos
 * filtros compartilháveis. Funções PURAS (sem React) — testáveis isoladas.
 *
 *   /inbox?c=<id>&view=mine&status=OPEN&label=<id>&channel=WHATSAPP&assigned=<id>&owner=<id>
 */

/** Filtros rápidos (segmentação principal). "unassigned" depende de suporte do backend. */
export const INBOX_VIEWS = ["all", "mine", "unread", "open", "closed"] as const;
export type InboxView = (typeof INBOX_VIEWS)[number];

const KNOWN_STATUS = new Set(["OPEN", "PENDING", "RESOLVED", "ARCHIVED", "BLOCKED"]);
const KNOWN_CHANNEL = new Set(["WHATSAPP", "INSTAGRAM", "MESSENGER", "TELEGRAM", "EMAIL", "SMS"]);

export interface InboxAdvancedFilters {
  status?: string;
  assignedToUserId?: string;
  ownerId?: string;
  labelId?: string;
  channel?: string;
  archived?: boolean;
}

export interface InboxUrlState {
  selectedId?: string;
  view: InboxView;
  advanced: InboxAdvancedFilters;
}

function get(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key);
  return v && v.length > 0 ? v : undefined;
}

/** Lê o estado da URL, NORMALIZANDO valores inválidos (ignorados com segurança). */
export function parseInboxSearch(params: URLSearchParams): InboxUrlState {
  const rawView = get(params, "view");
  const view: InboxView = (INBOX_VIEWS as readonly string[]).includes(rawView ?? "")
    ? (rawView as InboxView)
    : "all";
  const status = get(params, "status");
  const channel = get(params, "channel");
  return {
    selectedId: get(params, "c"),
    view,
    advanced: {
      status: status && KNOWN_STATUS.has(status) ? status : undefined,
      assignedToUserId: get(params, "assigned"),
      ownerId: get(params, "owner"),
      labelId: get(params, "label"),
      channel: channel && KNOWN_CHANNEL.has(channel) ? channel : undefined,
      archived: get(params, "archived") === "1" ? true : undefined,
    },
  };
}

/** Serializa o estado em query string (chaves omitidas quando vazias). */
export function buildInboxSearch(state: InboxUrlState): string {
  const p = new URLSearchParams();
  if (state.selectedId) p.set("c", state.selectedId);
  if (state.view !== "all") p.set("view", state.view);
  const a = state.advanced;
  if (a.status) p.set("status", a.status);
  if (a.assignedToUserId) p.set("assigned", a.assignedToUserId);
  if (a.ownerId) p.set("owner", a.ownerId);
  if (a.labelId) p.set("label", a.labelId);
  if (a.channel) p.set("channel", a.channel);
  if (a.archived) p.set("archived", "1");
  return p.toString();
}

/**
 * Converte a view rápida em filtros do backend. `all` = sem filtro; `mine` exige
 * o id do usuário atual. `unread` usa `unreadOnly`; `open`/`closed` mapeiam status.
 */
export function viewToFilters(view: InboxView, currentUserId: string | null): ConversationFilters {
  switch (view) {
    case "mine":
      return currentUserId ? { assignedToUserId: currentUserId } : {};
    case "unread":
      return { unreadOnly: true };
    case "open":
      return { status: "OPEN" };
    case "closed":
      return { status: "RESOLVED" };
    default:
      return {};
  }
}

/**
 * Resolve os filtros efetivos (backend) a partir do estado da URL + busca. Os
 * filtros avançados têm precedência sobre os derivados da view (status explícito
 * vence o da view).
 */
export function resolveFilters(
  state: InboxUrlState,
  currentUserId: string | null,
  search: string | undefined,
): ConversationFilters {
  const fromView = viewToFilters(state.view, currentUserId);
  const a = state.advanced;
  return {
    ...fromView,
    ...(a.status ? { status: a.status } : {}),
    ...(a.assignedToUserId ? { assignedToUserId: a.assignedToUserId } : {}),
    ...(a.ownerId ? { ownerId: a.ownerId } : {}),
    ...(a.labelId ? { labelId: a.labelId } : {}),
    ...(a.channel ? { channel: a.channel } : {}),
    ...(a.archived ? { archived: true } : {}),
    ...(search ? { search } : {}),
  };
}

/** Quantos filtros AVANÇADOS estão ativos (para badge no botão de filtros). */
export function activeAdvancedCount(a: InboxAdvancedFilters): number {
  return [a.status, a.assignedToUserId, a.ownerId, a.labelId, a.channel, a.archived ? "1" : undefined]
    .filter(Boolean).length;
}
