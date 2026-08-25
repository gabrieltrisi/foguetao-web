/**
 * Constantes da arquitetura da Inbox (F0). Centraliza tempos, breakpoints e o
 * catálogo de filtros rápidos — nunca hardcodar espalhado nos componentes.
 */

/** Autosave de rascunho: debounce e sinalização de "salvo". */
export const DRAFT_DEBOUNCE_MS = 800;
export const DRAFT_SAVED_INDICATOR_MS = 1500;

/** Busca da lista: debounce do input. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Breakpoints da Inbox (px) — alinhados ao Tailwind do projeto. */
export const INBOX_BREAKPOINTS = {
  /** < md: uma visão por vez (lista → conversa → detalhes). */
  singlePane: 768,
  /** >= lg: lista + conversa. */
  dualPane: 1024,
  /** >= xl: três painéis (adiciona o contextual). */
  triPane: 1280,
} as const;

/** Larguras dos painéis (px) — mínima/ideal para o layout desktop. */
export const INBOX_PANEL_WIDTHS = {
  listMin: 300,
  listIdeal: 340,
  contextMin: 300,
  contextIdeal: 360,
} as const;

/** Modos do composer. A troca para nota interna deve ser visualmente inequívoca. */
export const COMPOSER_MODES = ["reply", "note"] as const;
export type ComposerMode = (typeof COMPOSER_MODES)[number];

/**
 * Filtros RÁPIDOS da lista (segmentação principal). Mapeiam para os parâmetros
 * reais do backend (status/assigned/unread). Filtros avançados (owner/label/canal)
 * ficam em um painel separado.
 */
export const INBOX_QUICK_FILTERS = [
  { key: "mine", label: "Minhas" },
  { key: "unassigned", label: "Não atribuídas" },
  { key: "all", label: "Todas" },
  { key: "open", label: "Abertas" },
  { key: "unread", label: "Não lidas" },
  { key: "closed", label: "Fechadas" },
] as const;
export type InboxQuickFilterKey = (typeof INBOX_QUICK_FILTERS)[number]["key"];

/** Quais filtros entram na URL (compartilháveis/deep-link). */
export const URL_PERSISTED_FILTERS = ["q", "status", "assignedToUserId", "ownerId", "labelId", "channel"] as const;
