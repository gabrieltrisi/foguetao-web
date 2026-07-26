import type { ConversationFilters, MessageFilters } from "@/types/api/messaging";

/**
 * Factory ÚNICA das query keys da Inbox (F0). O root é `"messaging"` — o MESMO
 * usado pelo dispatcher realtime (`messagingInvalidation` em `lib/query/keys.ts`),
 * garantindo que as invalidações do realtime casem por PREFIXO com estas keys.
 * Os hooks anexam `activeCompanyId` (e sufixos como `"public"`/`"infinite"`) ao
 * final; a invalidação por prefixo casa independentemente do que é anexado.
 *
 * NUNCA escrever strings de query key soltas em componentes/hooks — usar isto.
 */
const ROOT = "messaging" as const;

export const inboxKeys = {
  all: [ROOT] as const,
  /** Prefixo de TODAS as listas de conversas (qualquer filtro/cursor). */
  lists: () => [ROOT, "conversations"] as const,
  list: (filters?: ConversationFilters) => [ROOT, "conversations", filters ?? {}] as const,
  /** Detalhe de UMA conversa. */
  detail: (id: string) => [ROOT, "conversation", id] as const,
  /** Prefixo das mensagens de UMA conversa (qualquer filtro). */
  messagesAll: (id: string) => [ROOT, "conversation", id, "messages"] as const,
  messages: (id: string, filters?: MessageFilters) =>
    [ROOT, "conversation", id, "messages", filters ?? {}] as const,
  /** Rascunho do usuário atual em UMA conversa. */
  draft: (id: string) => [ROOT, "conversation", id, "draft"] as const,
  /** Taxonomia de etiquetas da empresa. */
  labels: () => [ROOT, "labels"] as const,
  /** Contas de messaging (canais). */
  accounts: () => [ROOT, "accounts"] as const,
};

/** Prefixos de invalidação (espelham o dispatcher realtime). */
export const inboxInvalidation = {
  allConversations: inboxKeys.lists(),
  conversation: (id: string) => inboxKeys.detail(id),
  messages: (id: string) => inboxKeys.messagesAll(id),
  draft: (id: string) => inboxKeys.draft(id),
  labels: inboxKeys.labels(),
  allAccounts: inboxKeys.accounts(),
};
