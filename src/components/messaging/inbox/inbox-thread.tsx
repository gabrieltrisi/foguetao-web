"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useSession } from "@/providers/session-provider";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { useContacts } from "@/hooks/crm/use-contacts";
import { useSendInboxMessage } from "@/hooks/messaging/use-inbox";
import { chatTitle, sendability } from "@/lib/messaging/display";
import { isApiError } from "@/types/api/error";
import { InboxSendabilityBanner } from "@/components/messaging/inbox/inbox-sendability-banner";
import { Composer, type ReplyTarget } from "@/features/inbox/components/composer/composer";
import { ConversationHeader } from "@/features/inbox/components/header/conversation-header";
import { ConversationTimeline } from "@/features/inbox/components/timeline/conversation-timeline";
import { clientMessageIdFromTempId } from "@/features/inbox/optimistic";
import type { TimelineMessageVM } from "@/features/inbox/view-models";

/** Prévia curta de uma mensagem para o chip de "Respondendo a:". */
function replyPreview(m: TimelineMessageVM): string {
  const t = m.text?.trim();
  if (t) return t.length > 80 ? `${t.slice(0, 80)}…` : t;
  return m.hasMedia ? "Anexo" : "Mensagem";
}

/**
 * Thread da Inbox. O detalhe (`useConversation`) traz `canSend`/`sendabilityReason`/
 * `sendabilityDetail` + `unreadForUser`. Histórico na `ConversationTimeline` (F2A–C) e
 * o `Composer` DEFINITIVO (F3): modos Responder/Nota, bloqueios, drafts, otimista.
 *
 * NÃO marca a conversa como lida ao abrir (leitura explícita — F2C). `onBack` volta no
 * mobile; `onNotFound` remove a seleção inválida (404).
 */
export function InboxThread({
  conversationId,
  onBack,
  onNotFound,
  onOpenContext,
}: {
  conversationId: string;
  onBack?: () => void;
  onNotFound?: () => void;
  onOpenContext?: () => void;
}) {
  const { can } = useSession();
  const detail = useConversation(conversationId);
  // Resolve o NOME do contato (mesmo cache da lista) → header consistente com a
  // lista: um número já salvo mostra "Leticia", não o pushName curto ("Let").
  const contacts = useContacts({ limit: 100 });
  const send = useSendInboxMessage(conversationId);
  const canSendPerm = can("messaging.messages.send");
  const canNotePerm = can("messaging.conversations.note");

  // Alvo de resposta (auxílio de composição). O pai monta o `InboxThread` com
  // `key={conversationId}` → o estado reinicia sozinho ao trocar de conversa.
  const [replyTarget, setReplyTarget] = React.useState<ReplyTarget | null>(null);
  const handleReply = React.useCallback(
    (m: TimelineMessageVM) => setReplyTarget({ id: m.id, preview: replyPreview(m) }),
    [],
  );
  const clearReply = React.useCallback(() => setReplyTarget(null), []);

  // Retry de uma mensagem OTIMISTA falha: reusa o MESMO clientMessageId (idempotente
  // no backend) → a temp volta a SENDING; não cria mensagem nova. Preserva o texto.
  const sendMutate = send.mutate;
  const handleRetry = React.useCallback(
    (message: TimelineMessageVM) => {
      if (!message.text) return;
      const clientMessageId = clientMessageIdFromTempId(message.id) ?? crypto.randomUUID();
      sendMutate({ text: message.text, clientMessageId });
    },
    [sendMutate],
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
  // Preferir o nome do CONTATO vinculado (CRM) sobre pushName/telefone.
  const contactFullName = conversation.contactId
    ? (contacts.data?.items.find((c) => c.id === conversation.contactId)?.fullName ?? null)
    : null;
  const name = contactFullName ?? chatTitle(conversation, counterpart);
  const view = sendability(conversation.canSend, conversation.sendabilityReason);

  return (
    <div className="flex h-full flex-col">
      <ConversationHeader
        conversation={conversation}
        name={name}
        phone={counterpart?.phone}
        onBack={onBack}
        onOpenContext={onOpenContext}
      />

      <InboxSendabilityBanner view={view} />

      <ConversationTimeline
        conversationId={conversationId}
        unreadForUser={conversation.unreadForUser}
        counterpartName={name}
        onRetry={handleRetry}
        onReply={handleReply}
      />

      <Composer
        conversationId={conversationId}
        canSendPerm={canSendPerm}
        canNotePerm={canNotePerm}
        sendabilityCanSend={view.canSend}
        sendabilityMessage={view.message}
        sendabilityDetail={conversation.sendabilityDetail}
        replyTarget={replyTarget}
        onClearReply={clearReply}
      />
    </div>
  );
}
