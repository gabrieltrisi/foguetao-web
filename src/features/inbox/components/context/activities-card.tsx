"use client";

import { useSession } from "@/providers/session-provider";
import { useContactActivities } from "@/hooks/crm/use-contact-lists";
import { activityTypeLabel, formatDateTime } from "@/lib/crm/display";
import { PanelSection } from "./panel-section";

/**
 * Card ATIVIDADES (F6). Feed de auditoria do contato (`useContactActivities`; ordenado
 * por mais recente no backend). Primeira página — a paginação profunda fica no CRM.
 */
export function ActivitiesCard({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const denied = !can("crm.activities.read");
  const q = useContactActivities(contactId);
  const items = q.data?.items ?? [];

  return (
    <PanelSection
      title="Atividades"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && items.length === 0}
      emptyLabel="Sem atividades."
      onRetry={() => void q.refetch()}
    >
      <ul className="space-y-2">
        {items.slice(0, 8).map((a) => (
          <li key={a.id} className="flex gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand/50" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-caption text-ink">
                {a.title || activityTypeLabel[a.type] || a.type}
              </p>
              <p className="text-micro text-ink-3">{formatDateTime(a.occurredAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}
