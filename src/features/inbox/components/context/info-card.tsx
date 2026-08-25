"use client";

import { useSession } from "@/providers/session-provider";
import { useContact } from "@/hooks/crm/use-contact-detail";
import { contactStatusMeta, formatDate } from "@/lib/crm/display";
import { PanelSection, Field } from "./panel-section";

/**
 * Card INFORMAÇÕES (F6): tags, status, responsável (dono), criado/atualizado. Reusa a
 * MESMA query `useContact` do card de contato (o React Query deduplica — 1 só fetch).
 */
export function InfoCard({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const denied = !can("crm.contacts.read");
  const q = useContact(contactId);
  const d = q.data;
  const status = d?.contact ? contactStatusMeta[d.contact.status] : undefined;

  return (
    <PanelSection
      title="Informações"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && !d}
      onRetry={() => void q.refetch()}
    >
      {d ? (
        <div className="space-y-2">
          {d.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1" aria-label="Etiquetas">
              {d.tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-micro text-ink-2"
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: t.color ?? undefined }} aria-hidden />
                  {t.name}
                </span>
              ))}
            </div>
          ) : null}
          <div>
            <Field label="Status" value={status?.label} />
            <Field label="Responsável" value={d.assignee?.name ?? "—"} />
            <Field label="Criado em" value={formatDate(d.contact.createdAt)} />
            <Field label="Atualizado em" value={formatDate(d.contact.updatedAt)} />
          </div>
        </div>
      ) : null}
    </PanelSection>
  );
}
