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
import {
  useConversation,
  useMarkConversationRead,
} from "@/hooks/messaging/use-conversations";
import {
  useCancelInboxMessage,
  useInboxMessages,
  useSendInboxMessage,
} from "@/hooks/messaging/use-inbox";
import {
  chatTitle,
  groupByDay,
  messageForSendError,
  sendability,
  statusMeta,
} from "@/lib/messaging/display";
import { isApiError } from "@/types/api/error";
import { InboxMessage } from "@/components/messaging/inbox/inbox-message";
import { InboxSendabilityBanner } from "@/components/messaging/inbox/inbox-sendability-banner";
import { InboxComposer } from "@/components/messaging/inbox/inbox-composer";

const PAGE = 30;

/**
 * Thread da Inbox. O detalhe (`useConversation`) traz `canSend` +
 * `sendabilityReason` (Fase 6.1) e o histórico (`useInboxMessages`) traz o DTO
 * público. Sem realtime: nada de polling/WebSocket.
 *
 * `onBack` volta para a lista no mobile; `onNotFound` remove a seleção inválida
 * quando a conversa some (404).
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
  const markRead = useMarkConversationRead(conversationId);
  const send = useSendInboxMessage(conversationId);
  const cancel = useCancelInboxMessage(conversationId);

  const canReadMessages = can("messaging.messages.read");
  const canUpdate = can("messaging.conversations.update");
  const canSendPerm = can("messaging.messages.send");

  /**
   * Envia (202/QUEUED). `clientMessageId` via crypto.randomUUID() (idempotência).
   * Em falha, o toast informa e o erro é relançado para o composer PRESERVAR o
   * texto; em sucesso o composer limpa sozinho.
   */
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

  /** Cancela uma mensagem agendada antes do despacho (Sprint 7.2). */
  const handleCancel = React.useCallback(
    (messageId: string) => {
      cancel.mutate(messageId, {
        onSuccess: () => toast({ title: "Agendamento cancelado", variant: "success" }),
        onError: (error) =>
          toast({
            title:
              isApiError(error) && error.statusCode === 409
                ? "Não foi possível cancelar: a mensagem já saiu."
                : messageForSendError(error),
            variant: "error",
          }),
      });
    },
    [cancel, toast],
  );

  // 404 → some da lista: limpar a seleção inválida (uma vez).
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

      <ThreadHistory
        conversationId={conversationId}
        canRead={canReadMessages}
        onCancel={canSendPerm ? handleCancel : undefined}
        canceling={cancel.isPending}
        onFirstView={() => {
          if (conversation.unreadCount > 0 && canUpdate) markRead.mutate();
        }}
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

/** Histórico com scroll: fim ao abrir, posição preservada ao carregar anteriores. */
function ThreadHistory({
  conversationId,
  canRead,
  onFirstView,
  onCancel,
  canceling,
}: {
  conversationId: string;
  canRead: boolean;
  onFirstView: () => void;
  onCancel?: (messageId: string) => void;
  canceling?: boolean;
}) {
  const messages = useInboxMessages(conversationId, { limit: PAGE });
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prevHeight = React.useRef<number | null>(null);
  const pinnedInitial = React.useRef(false);

  const all = React.useMemo(
    () => messages.data?.pages.flatMap((p) => p.items) ?? [],
    [messages.data],
  );
  const groups = React.useMemo(() => groupByDay(all), [all]);
  const count = all.length;

  // Zera o não lidas na primeira renderização com dados (uma vez por conversa).
  const markedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (count > 0 && markedFor.current !== conversationId) {
      markedFor.current = conversationId;
      onFirstView();
    }
  }, [count, conversationId, onFirstView]);

  // Trocar de conversa reinicia o "ancorar no fim".
  React.useEffect(() => {
    pinnedInitial.current = false;
  }, [conversationId]);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevHeight.current != null) {
      // Carregou anteriores (prepend): mantém a posição relativa do usuário.
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = null;
    } else if (!pinnedInitial.current && count > 0) {
      el.scrollTop = el.scrollHeight; // primeira exibição → fim
      pinnedInitial.current = true;
    }
  }, [count]);

  function loadEarlier() {
    const el = scrollRef.current;
    prevHeight.current = el ? el.scrollHeight : null;
    messages.fetchNextPage();
  }

  return (
    <div ref={scrollRef} className="no-scrollbar flex-1 space-y-2 overflow-y-auto bg-surface p-4">
      {!canRead ? (
        <p className="py-10 text-center text-body2 text-ink-3">
          Você não tem permissão para ler mensagens.
        </p>
      ) : messages.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-2/3" />
          ))}
        </div>
      ) : messages.isError ? (
        <p role="alert" className="py-10 text-center text-body2 text-danger">
          Não foi possível carregar as mensagens.
        </p>
      ) : groups.length === 0 ? (
        <p className="py-10 text-center text-body2 text-ink-3">
          Nenhuma mensagem nesta conversa ainda.
        </p>
      ) : (
        <>
          {messages.hasNextPage ? (
            <div className="flex justify-center pb-2">
              <Button
                size="sm"
                variant="secondary"
                loading={messages.isFetchingNextPage}
                onClick={loadEarlier}
              >
                Carregar mensagens anteriores
              </Button>
            </div>
          ) : null}
          {groups.map((group) => (
            <div key={group.day} className="space-y-2">
              <div className="mb-2 flex justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-caption font-medium text-ink-2 shadow-sm">
                  {group.day}
                </span>
              </div>
              {group.items.map((m) => (
                <InboxMessage key={m.id} message={m} onCancel={onCancel} canceling={canceling} />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
