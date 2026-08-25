"use client";

import * as React from "react";
import { ChevronLeft, PanelRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCreateContactFromConversation } from "@/features/inbox/hooks/use-inbox-mutations";
import { channelPresentation } from "@/features/inbox/format";
import type { ApiConversationDetail } from "@/types/api/messaging";
import { StatusControl } from "./status-control";
import { LabelControl } from "./label-control";
import { AssignmentControl } from "./assignment-control";

/**
 * Header operacional da conversa (F4) — ISOLADO da timeline (as ações aqui não
 * re-renderizam o histórico; a timeline é `React.memo`). Linha 1: voltar/avatar/nome/
 * canal + status. Linha 2: etiquetas + responsável. Cada controle cuida de permissão,
 * realtime e cache; aqui é só composição.
 */
export const ConversationHeader = React.memo(function ConversationHeader({
  conversation,
  name,
  phone,
  onBack,
  onOpenContext,
}: {
  conversation: ApiConversationDetail;
  name: string;
  phone?: string | null;
  onBack?: () => void;
  onOpenContext?: () => void;
}) {
  const channel = conversation.channel ? channelPresentation(conversation.channel) : null;
  const subtitle = [channel?.label, phone].filter(Boolean).join(" · ");

  return (
    <header className="border-b border-line px-3 py-2.5">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Voltar" onClick={onBack}>
            <ChevronLeft />
          </Button>
        ) : null}
        <EntityAvatar name={name} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-h3 font-semibold text-ink">{name}</p>
          {subtitle ? <p className="truncate text-caption text-ink-3">{subtitle}</p> : null}
        </div>
        {onOpenContext ? (
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Ver contexto do contato"
            onClick={onOpenContext}
          >
            <PanelRight />
          </Button>
        ) : null}
        <StatusControl conversationId={conversation.id} status={conversation.status} />
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <LabelControl conversationId={conversation.id} labels={conversation.labels ?? []} />
        <div className="flex items-center gap-2">
          <AddToContactsButton conversationId={conversation.id} contactId={conversation.contactId} />
          <AssignmentControl
            conversationId={conversation.id}
            assignedToUserId={conversation.assignedToUserId}
            version={conversation.version}
          />
        </div>
      </div>
    </header>
  );
});

/**
 * Transforma esta conversa (número que te mandou mensagem) em Contact. Idempotente.
 * Some quando a conversa JÁ tem contato vinculado (`contactId`) — nada a adicionar.
 */
function AddToContactsButton({
  conversationId,
  contactId,
}: {
  conversationId: string;
  contactId: string | null;
}) {
  const { can } = useSession();
  const { toast } = useToast();
  const mutation = useCreateContactFromConversation();
  if (contactId) return null; // já é contato — não oferecer de novo
  if (!can("crm.contacts.create")) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={mutation.isPending}
      onClick={() =>
        mutation.mutate(conversationId, {
          onSuccess: (r) =>
            toast({
              title: r.created ? "Contato criado" : "Já estava nos contatos",
              variant: "success",
            }),
          onError: () => toast({ title: "Não foi possível criar o contato", variant: "error" }),
        })
      }
    >
      <UserPlus className="size-4" aria-hidden /> Adicionar aos contatos
    </Button>
  );
}
