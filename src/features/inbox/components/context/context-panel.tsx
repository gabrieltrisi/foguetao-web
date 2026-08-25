"use client";

import * as React from "react";
import { UserX } from "lucide-react";
import { useConversation } from "@/hooks/messaging/use-conversations";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { CopilotSection } from "@/features/copilot/components/copilot-section";
import { ContactCard } from "./contact-card";
import { CompanyCard } from "./company-card";
import { DealsCard } from "./deals-card";
import { ActivitiesCard } from "./activities-card";
import { NotesCard } from "./notes-card";
import { TasksCard } from "./tasks-card";
import { FilesCard } from "./files-card";
import { InfoCard } from "./info-card";

/**
 * Painel CONTEXTUAL (F6). DESACOPLADO da timeline (é irmão do `InboxThread` no shell;
 * `React.memo` + cards independentes → ações aqui não re-renderizam o histórico). Keya
 * em `conversation.contactId` (nullable → estado vazio). Cada card tem query/loading/
 * erro/retry próprios. Realtime de CRM NÃO existe (só messaging) → convergência por
 * refetch do React Query + invalidação precisa das escritas próprias.
 */
export const ContextPanel = React.memo(function ContextPanel({
  conversationId,
}: {
  conversationId: string;
}) {
  const conv = useConversation(conversationId);
  const contactId = conv.data?.contactId ?? null;
  const channel = conv.data?.channel ?? null;
  // Só para resolver a organização do contato (deduplicado com os cards).
  const contactQ = useContact(contactId ?? "");
  const organizationId = contactQ.data?.contact.organizationId ?? null;

  if (conv.isLoading) {
    return (
      <div className="p-3 text-caption text-ink-3" aria-busy>
        Carregando contexto…
      </div>
    );
  }

  if (!contactId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-caption text-ink-3">
        <UserX className="size-6" aria-hidden />
        <p>Nenhum contato vinculado a esta conversa.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" aria-label="Contexto do contato">
      <CopilotSection conversationId={conversationId} contactId={contactId} />
      <ContactCard contactId={contactId} channel={channel} />
      <CompanyCard organizationId={organizationId} />
      <DealsCard contactId={contactId} />
      <ActivitiesCard contactId={contactId} />
      <NotesCard contactId={contactId} />
      <TasksCard contactId={contactId} />
      <FilesCard />
      <InfoCard contactId={contactId} />
    </div>
  );
});
