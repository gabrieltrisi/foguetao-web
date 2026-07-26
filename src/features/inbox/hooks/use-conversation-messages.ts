"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { useSession } from "@/providers/session-provider";
import { inboxKeys } from "@/features/inbox/query-keys";
import type { MessageFilters } from "@/types/api/messaging";

/**
 * Histórico da conversa (F2A) — infinite query por CURSOR. O backend devolve as
 * MAIS RECENTES primeiro; `fetchNextPage` busca as ANTERIORES (paginação reversa).
 * A ordem VISUAL é produzida por `flattenTimelinePages` (nunca invertida no JSX).
 *
 * Query key oficial (`inboxKeys.messages` = root "messaging") — o dispatcher
 * realtime insere a mensagem nova por esse prefixo. `enabled` só com conversa +
 * empresa + permissão; troca de conversa/empresa muda a key e reinicia sozinho.
 * Sem estado local paralelo (React Query é a fonte).
 */
export function useConversationMessages(conversationId: string | undefined, filters?: MessageFilters) {
  const { activeCompanyId, can } = useSession();
  return useInfiniteQuery({
    queryKey: [...inboxKeys.messages(conversationId ?? "none", filters), activeCompanyId, "public"],
    queryFn: ({ pageParam, signal }) =>
      messagingApi.listConversationMessages(
        conversationId as string,
        { ...filters, cursor: pageParam },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: Boolean(activeCompanyId) && Boolean(conversationId) && can("messaging.messages.read"),
  });
}
