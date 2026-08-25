/**
 * Regras PURAS de STATUS de conversa (F4) — sem React, testáveis.
 *
 * Enum REAL do backend: OPEN | PENDING | RESOLVED | ARCHIVED | BLOCKED. NÃO existe
 * `CLOSED` (é alias conceitual de RESOLVED; `/close` grava RESOLVED). NÃO há endpoint
 * dirigido por agente para PENDING nem BLOCKED — só `resolve`/`reopen`/`archive`. A
 * máquina de estados abaixo espelha o backend (`conversation-status.ts`); as ações são
 * filtradas pelo destino REALMENTE alcançável a partir do estado atual.
 */

export type ConversationStatus = "OPEN" | "PENDING" | "RESOLVED" | "ARCHIVED" | "BLOCKED";

/** Transições permitidas (destino) por estado — espelha o backend. */
const NEXT: Record<string, ConversationStatus[]> = {
  OPEN: ["PENDING", "RESOLVED", "ARCHIVED", "BLOCKED"],
  PENDING: ["OPEN", "RESOLVED", "ARCHIVED", "BLOCKED"],
  RESOLVED: ["OPEN", "ARCHIVED", "BLOCKED"],
  ARCHIVED: ["OPEN", "BLOCKED"],
  BLOCKED: ["OPEN"],
};

export function canTransition(from: string, to: ConversationStatus): boolean {
  return NEXT[from]?.includes(to) ?? false;
}

/** Endpoints de transição DISPONÍVEIS (dirigidos por agente). */
export type StatusEndpoint = "resolve" | "reopen" | "archive";

export interface StatusAction {
  key: StatusEndpoint;
  label: string;
  target: ConversationStatus;
  endpoint: StatusEndpoint;
  /** Permissão necessária (o backend guarda cada rota com uma permissão distinta). */
  permission: string;
  /** Pede confirmação (ações que "encerram"/removem da caixa ativa). */
  confirm: boolean;
  confirmText?: string;
}

const ACTIONS: StatusAction[] = [
  {
    key: "reopen",
    label: "Reabrir",
    target: "OPEN",
    endpoint: "reopen",
    permission: "messaging.conversations.reopen",
    confirm: false,
  },
  {
    key: "resolve",
    label: "Resolver",
    target: "RESOLVED",
    endpoint: "resolve",
    permission: "messaging.conversations.resolve",
    confirm: true,
    confirmText: "Marcar esta conversa como resolvida?",
  },
  {
    key: "archive",
    label: "Arquivar",
    target: "ARCHIVED",
    endpoint: "archive",
    permission: "messaging.conversations.update",
    confirm: true,
    confirmText: "Arquivar esta conversa? Ela sai da caixa ativa.",
  },
];

/**
 * Ações de status oferecidas a partir do estado atual: só as cujo destino é alcançável
 * pela máquina de estados E têm endpoint dirigido por agente. NÃO filtra por permissão
 * (o chamador desabilita a ação sem esconder — regra de permissões da sprint).
 */
export function statusActions(current: string): StatusAction[] {
  return ACTIONS.filter((a) => canTransition(current, a.target));
}
