"use client";

import { Badge } from "@/components/ui/badge";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { contactSourceLabel, contactStatusMeta, formatDateTime } from "@/lib/crm/display";
import { channelPresentation } from "@/features/inbox/format";
import { PanelSection, Field } from "./panel-section";

/**
 * Card CONTATO (F6). Fonte: `useContact` (agregado — sem `channel`, então o canal vem
 * da CONVERSA). Avatar por iniciais (o DTO não expõe avatar). Só leitura.
 */
export function ContactCard({
  contactId,
  channel,
}: {
  contactId: string;
  channel?: string | null;
}) {
  const { can } = useSession();
  const denied = !can("crm.contacts.read");
  const q = useContact(contactId);
  const c = q.data?.contact;
  const status = c ? contactStatusMeta[c.status] : undefined;
  const ch = channel ? channelPresentation(channel) : null;

  return (
    <PanelSection
      title="Contato"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && !c}
      emptyLabel="Contato não encontrado."
      onRetry={() => void q.refetch()}
    >
      {c ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <EntityAvatar name={c.fullName} size="md" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body2 font-semibold text-ink">{c.fullName}</p>
              {c.jobTitle ? <p className="truncate text-caption text-ink-3">{c.jobTitle}</p> : null}
            </div>
            {status ? <Badge tone={status.tone}>{status.label}</Badge> : null}
          </div>
          <div>
            <Field label="Telefone" value={c.phone ?? c.whatsappPhone} />
            <Field label="E-mail" value={c.email} />
            <Field label="Origem" value={c.source ? (contactSourceLabel[c.source] ?? c.source) : null} />
            <Field label="Canal" value={ch?.label} />
            <Field label="Última interação" value={c.lastActivityAt ? formatDateTime(c.lastActivityAt) : null} />
          </div>
        </div>
      ) : null}
    </PanelSection>
  );
}
