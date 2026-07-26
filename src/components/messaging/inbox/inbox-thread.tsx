"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { useSendInboxMessage } from "@/hooks/messaging/use-inbox";
import { chatTitle, messageForSendError, sendability, statusMeta } from "@/lib/messaging/display";
import { isApiError } from "@/types/api/error";
import { InboxSendabilityBanner } from "@/components/messaging/inbox/inbox-sendability-banner";
import { InboxComposer } from "@/components/messaging/inbox/inbox-composer";
import { ConversationTimeline } from "@/features/inbox/components/timeline/conversation-timeline";

/**
 * Thread da Inbox. O detalhe (`useConversation`) traz `canSend`/`sendabilityReason`
 * + `unreadForUser`. A área de histórico usa a NOVA `ConversationTimeline` (F2A):
 * paginação reversa, agrupamento, separadores e preservação de scroll. O cabeçalho
 * e o composer (legado) permanecem; a renderização final da mensagem é F2B.
 *
 * F2A: NÃO marca a conversa como lida ao abrir (leitura é operação explícita —
 * F2C/F4). `onBack` volta no mobile; `onNotFound` remove a seleção inválida (404).
 */
export function InboxThread({
  conversationId,
  onBack,
  onNotFound,
}: {
  conversationId: string;
  onBack?: () => void;
  onNotFound?: () => void;
}) {
  const { can } = useSession();
  const { toast } = useToast();
  const detail = useConversation(conversationId);
  const send = useSendInboxMessage(conversationId);
  const canSendPerm = can("messaging.messages.send");

  const handleSend = React.useCallback(
    async (text: string, sendAt?: string) => {
      try {
        await send.mutateAsync({ text, clientMessageId: crypto.randomUUID(), sendAt });
      } catch (error) {
        toast({ title: messageForSendError(error), variant: "error" });
        throw error;
      }
    },
    [send, toast],
  );

  const notFound = detail.isError && isApiError(detail.error) && detail.error.statusCode === 404;
  const notifiedNotFound = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (notFound && notifiedNotFound.current !== conversationId) {
      notifiedNotFound.current = conversationId;
      onNotFound?.();
    }
  }, [notFound, conversationId, onNotFound]);

  if (detail.isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          variant="card"
          title={notFound ? "Conversa não encontrada." : "Não foi possível carregar a conversa."}
          onRetry={notFound ? undefined : () => detail.refetch()}
        />
      </div>
    );
  }

  const conversation = detail.data;
  const counterpart = conversation.participants.find((p) => p.type !== "AGENT");
  const name = chatTitle(conversation, counterpart);
  const status = statusMeta(conversation.status);
  const view = sendability(conversation.canSend, conversation.sendabilityReason);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        {onBack ? (
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Voltar" onClick={onBack}>
            <ChevronLeft />
          </Button>
        ) : null}
        <EntityAvatar name={name} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{name}</p>
          {counterpart?.phone ? (
            <p className="truncate text-caption text-ink-3">{counterpart.phone}</p>
          ) : null}
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </header>

      <InboxSendabilityBanner view={view} />

      <ConversationTimeline
        conversationId={conversationId}
        unreadForUser={conversation.unreadForUser}
      />

      <InboxComposer
        canSend={view.canSend && canSendPerm}
        disabledReason={
          !canSendPerm
            ? "Você não tem permissão para enviar mensagens."
            : !view.canSend
              ? view.message
              : undefined
        }
        onSend={view.canSend && canSendPerm ? handleSend : undefined}
      />
    </div>
  );
}
