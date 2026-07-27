import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { messagingInvalidation } from "@/lib/query/keys";
import { campaignKeys } from "@/lib/campaigns/query-keys";
import { reconcileServerMessage } from "@/features/inbox/optimistic";
import { shouldApplyStatus, type RealtimeEvent } from "./realtime-events";
import type {
  ApiConversationList,
  ApiPublicMessage,
  ApiPublicMessageList,
  ApiPublicMessageListItems,
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
      // Thread aberta: upsert idempotente por id + colapso da mensagem OTIMISTA (o
      // eco do próprio envio, mesmo texto pendente) → nunca duplica (F2C).
      qc.setQueriesData<InfiniteData<ApiPublicMessageListItems>>(
        { queryKey: messagingInvalidation.messages(conversationId) },
        (old) => reconcileServerMessage(old, message),
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
      // Legado global (`unreadCount:0`) → zera imediato nas listas (snappy). Para a
      // leitura POR USUÁRIO (userId), a invalidação reconcilia `unreadForUser` via
      // refetch (a API é a fonte da verdade de quem leu). Sempre invalida.
      if (event.data.unreadCount === 0) zeroUnreadInLists(qc, event.data.conversationId);
      invalidate(messagingInvalidation.conversation(event.data.conversationId));
      invalidate(messagingInvalidation.allConversations);
      break;
    }

    // Inbox operacional (C3.1B/C/D): payloads id-only → invalidação reconcilia
    // (assignedTo/owner/status/labels/version) via refetch. Nunca faz patch cego de
    // dados sensíveis; a API HTTP é a fonte da verdade.
    case "conversation.assigned":
    case "conversation.unassigned":
    case "conversation.ownerChanged":
    case "conversation.labeled":
    case "conversation.closed":
    case "conversation.reopened": {
      invalidate(messagingInvalidation.conversation(event.data.conversationId));
      invalidate(messagingInvalidation.allConversations);
      break;
    }

    case "draft.saved":
    case "draft.deleted": {
      // Rascunho é POR USUÁRIO e cifrado — nunca chega conteúdo no evento. Invalida
      // a query do rascunho da conversa; a reconciliação de versão/conflito de abas
      // é responsabilidade do hook de rascunho (refetch autorizado).
      invalidate(messagingInvalidation.draft(event.data.conversationId));
      break;
    }

    case "account.updated": {
      // Status de conexão mudou → sendability das conversas pode ter mudado.
      invalidate(messagingInvalidation.allAccounts);
      invalidate(messagingInvalidation.allConversations);
      break;
    }

    // Campanhas (Sprint C2B): sem PII no payload — invalida as queries (a API é a
    // fonte da verdade). Progresso/métricas só tocam métricas+listas (mais quente);
    // eventos de ciclo de vida também tocam detalhe+timeline.
    case "campaign.progress":
    case "campaign.metrics.updated": {
      invalidate(campaignKeys.metrics(event.data.campaignId));
      invalidate(campaignKeys.lists());
      break;
    }
    case "campaign.started":
    case "campaign.paused":
    case "campaign.resumed":
    case "campaign.completed":
    case "campaign.canceled":
    case "campaign.failed": {
      const { campaignId } = event.data;
      invalidate(campaignKeys.detail(campaignId));
      invalidate(campaignKeys.metrics(campaignId));
      invalidate(campaignKeys.timeline(campaignId));
      invalidate(campaignKeys.lists());
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
