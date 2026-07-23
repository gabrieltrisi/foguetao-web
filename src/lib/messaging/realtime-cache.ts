import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { messagingInvalidation } from "@/lib/query/keys";
import { upsertNewestMessage } from "@/hooks/messaging/use-inbox";
import { shouldApplyStatus, type RealtimeEvent } from "./realtime-events";
import type {
  ApiConversationList,
  ApiPublicMessage,
  ApiPublicMessageList,
  PublicMessageStatus,
} from "@/types/api/messaging";

/** Agenda uma invalidação (coalescida/debounced pelo chamador). */
export type ScheduleInvalidate = (queryKey: readonly unknown[]) => void;

/**
 * Aplica UM evento realtime ao cache do React Query (fonte única — sem store
 * paralela). Estratégia híbrida: upsert imediato na thread + invalidação
 * (coalescida) das listas/detalhes. Reutiliza `upsertNewestMessage` e
 * `messagingInvalidation`; nunca inventa query keys nem toca queries não-messaging.
 */
export function applyRealtimeEvent(
  qc: QueryClient,
  event: RealtimeEvent,
  invalidate: ScheduleInvalidate,
): void {
  switch (event.type) {
    case "message.created": {
      const { conversationId, message } = event.data;
      // Thread aberta: upsert idempotente por id (não duplica o otimista do envio).
      qc.setQueriesData<InfiniteData<ApiPublicMessageList>>(
        { queryKey: messagingInvalidation.messages(conversationId) },
        (old) => upsertNewestMessage(old, message),
      );
      // Listas + conversa: invalidação reconcilia preview/lastMessageAt/unread/ordem.
      invalidate(messagingInvalidation.conversation(conversationId));
      invalidate(messagingInvalidation.allConversations);
      break;
    }

    case "message.statusChanged": {
      const { conversationId, messageId, status, failure } = event.data;
      qc.setQueriesData<InfiniteData<ApiPublicMessageList>>(
        { queryKey: messagingInvalidation.messages(conversationId) },
        (old) => applyStatusToThread(old, messageId, status, failure ?? null),
      );
      break;
    }

    case "conversation.updated": {
      invalidate(messagingInvalidation.conversation(event.data.conversationId));
      invalidate(messagingInvalidation.allConversations);
      break;
    }

    case "conversation.read": {
      // unreadCount → 0 imediato nas listas + invalidação (reconcilia filtro unreadOnly).
      zeroUnreadInLists(qc, event.data.conversationId);
      invalidate(messagingInvalidation.conversation(event.data.conversationId));
      invalidate(messagingInvalidation.allConversations);
      break;
    }
  }
}

/** Atualiza o status de UMA mensagem no cache da thread, respeitando monotonicidade. */
function applyStatusToThread(
  data: InfiniteData<ApiPublicMessageList> | undefined,
  messageId: string,
  status: PublicMessageStatus,
  failure: ApiPublicMessage["failure"],
): InfiniteData<ApiPublicMessageList> | undefined {
  if (!data) return data;
  let changed = false;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.map((m) => {
      if (m.id !== messageId || !shouldApplyStatus(m.status, status)) return m;
      changed = true;
      return { ...m, status, failure: failure ?? m.failure };
    }),
  }));
  return changed ? { ...data, pages } : data;
}

/** Zera unreadCount da conversa em TODAS as listas em cache (imediato). */
function zeroUnreadInLists(qc: QueryClient, conversationId: string): void {
  qc.setQueriesData<InfiniteData<ApiConversationList>>(
    { queryKey: messagingInvalidation.allConversations },
    (old) => {
      if (!old) return old;
      let changed = false;
      const pages = old.pages.map((page) => ({
        ...page,
        items: page.items.map((c) => {
          if (c.id !== conversationId || c.unreadCount === 0) return c;
          changed = true;
          return { ...c, unreadCount: 0 };
        }),
      }));
      return changed ? { ...old, pages } : old;
    },
  );
}
