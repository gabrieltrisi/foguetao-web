"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/business/entity-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { ChatComposer } from "@/components/messaging/chat-composer";
import { MessageRow } from "@/components/messaging/message-row";
import { useMessages, useSendMessage } from "@/hooks/messaging/use-messages";
import {
  useArchiveConversation,
  useMarkConversationRead,
  useReopenConversation,
  useResolveConversation,
} from "@/hooks/messaging/use-conversations";
import {
  chatTitle,
  groupByDay,
  messageForMessagingError,
  newClientMessageId,
  statusMeta,
} from "@/lib/messaging/display";
import type { ApiConversationDetail } from "@/types/api/messaging";

const PAGE = 30;

/**
 * Chat real. As mensagens vêm de `GET /messaging/conversations/:id/messages`
 * (cursor, mais recentes primeiro) e são exibidas em ordem cronológica.
 *
 * Sem realtime nesta sprint: o envio é assíncrono (202) e o estado novo chega
 * pelo refetch, não por socket. Presença ("online"/"digitando") não existe no
 * contrato e foi removida em vez de simulada.
 */
export function ChatView({ conversation }: { conversation: ApiConversationDetail }) {
  const { toast } = useToast();
  const { can } = useSession();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const messages = useMessages(conversation.id, { limit: PAGE });
  const { isLoading, isError } = messages;
  const send = useSendMessage(conversation.id);
  const resolve = useResolveConversation(conversation.id);
  const reopen = useReopenConversation(conversation.id);
  const archive = useArchiveConversation(conversation.id);
  const markRead = useMarkConversationRead(conversation.id);

  const counterpart = conversation.participants.find((p) => p.type !== "AGENT");
  const name = chatTitle(conversation, counterpart);
  const status = statusMeta(conversation.status);

  const canSend = can("messaging.messages.send");
  const canResolve = can("messaging.conversations.resolve");
  const canUpdate = can("messaging.conversations.update");
  const isOpen = conversation.status === "OPEN" || conversation.status === "PENDING";

  // Abrir a conversa zera o contador de não lidas (uma vez por conversa).
  const readOnce = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (conversation.unreadCount > 0 && canUpdate && readOnce.current !== conversation.id) {
      readOnce.current = conversation.id;
      markRead.mutate();
    }
  }, [conversation.id, conversation.unreadCount, canUpdate, markRead]);

  const groups = React.useMemo(
    () => groupByDay(messages.data?.pages.flatMap((p) => p.items) ?? []),
    [messages.data],
  );

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [groups]);

  function handleSend(text: string) {
    if (!counterpart?.phone) {
      toast({ title: "Conversa sem destinatário identificado.", variant: "error" });
      return;
    }
    send.mutate(
      {
        messagingAccountId: conversation.messagingAccountId,
        to: counterpart.phone,
        type: "TEXT",
        content: { text },
        clientMessageId: newClientMessageId(Date.now()),
        contactId: conversation.contactId ?? undefined,
      },
      { onError: (e) => toast({ title: messageForMessagingError(e), variant: "error" }) },
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <Link href="/conversations" aria-label="Voltar" className="lg:hidden">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft />
          </Button>
        </Link>
        <div className="relative shrink-0">
          <EntityAvatar name={name} size="md" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{name}</p>
          {counterpart?.phone ? (
            <p className="truncate text-caption text-ink-3">{counterpart.phone}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge tone={status.tone}>{status.label}</Badge>
          {canResolve || canUpdate ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {conversation.contactId ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/contacts/${conversation.contactId}`}>Ver contato</Link>
                  </DropdownMenuItem>
                ) : null}
                {canResolve && isOpen ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      resolve.mutate(undefined, {
                        onSuccess: () => toast({ title: "Conversa resolvida", variant: "success" }),
                        onError: (e) =>
                          toast({ title: messageForMessagingError(e), variant: "error" }),
                      })
                    }
                  >
                    Resolver conversa
                  </DropdownMenuItem>
                ) : null}
                {canResolve && !isOpen ? (
                  <DropdownMenuItem
                    onSelect={() =>
                      reopen.mutate(undefined, {
                        onSuccess: () => toast({ title: "Conversa reaberta", variant: "success" }),
                        onError: (e) =>
                          toast({ title: messageForMessagingError(e), variant: "error" }),
                      })
                    }
                  >
                    Reabrir conversa
                  </DropdownMenuItem>
                ) : null}
                {canUpdate && conversation.status !== "ARCHIVED" ? (
                  <DropdownMenuItem
                    className="text-danger [&_svg]:text-danger"
                    onSelect={() =>
                      archive.mutate(undefined, {
                        onSuccess: () => toast({ title: "Conversa arquivada", variant: "success" }),
                        onError: (e) =>
                          toast({ title: messageForMessagingError(e), variant: "error" }),
                      })
                    }
                  >
                    Arquivar conversa
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-2 overflow-y-auto bg-surface p-4">
        {!can("messaging.messages.read") ? (
          <p className="py-10 text-center text-body2 text-ink-3">
            Você não tem permissão para ler mensagens.
          </p>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-2/3" />
            ))}
          </div>
        ) : isError ? (
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
                  onClick={() => messages.fetchNextPage()}
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
                  <MessageRow key={m.id} message={m} conversationId={conversation.id} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {canSend && isOpen ? (
        <ChatComposer onSend={handleSend} />
      ) : (
        <p className={cn("border-t border-line px-4 py-3 text-center text-caption text-ink-3")}>
          {!canSend
            ? "Você não tem permissão para enviar mensagens."
            : "Reabra a conversa para enviar mensagens."}
        </p>
      )}
    </div>
  );
}
