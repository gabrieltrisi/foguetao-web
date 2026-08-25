"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { useOrganization } from "@/hooks/crm/use-organizations";
import { organizationSizeLabel } from "@/lib/crm/display";
import { PanelSection, Field } from "./panel-section";

/**
 * Card EMPRESA (F6). Fonte: `useOrganization`. O backend NÃO tem owner nem "segment"
 * de verdade — o mais próximo é `industry`. Sem organização vinculada → estado vazio.
 */
export function CompanyCard({ organizationId }: { organizationId: string | null | undefined }) {
  const { can } = useSession();
  const denied = !can("crm.organizations.read");
  const q = useOrganization(organizationId ?? "");
  const org = organizationId ? q.data : undefined;

  return (
    <PanelSection
      title="Empresa"
      denied={Boolean(organizationId) && denied}
      isLoading={Boolean(organizationId) && q.isLoading}
      isError={Boolean(organizationId) && q.isError}
      isEmpty={!organizationId || (!q.isLoading && !q.isError && !org)}
      emptyLabel="Sem empresa vinculada."
      onRetry={() => void q.refetch()}
      action={
        organizationId ? (
          <Link
            href={`/organizations/${organizationId}`}
            className="inline-flex items-center gap-1 text-micro font-medium text-brand hover:underline"
          >
            Abrir no CRM <ExternalLink className="size-3" aria-hidden />
          </Link>
        ) : undefined
      }
    >
      {org ? (
        <div>
          <p className="truncate text-body2 font-semibold text-ink">{org.name}</p>
          <div className="mt-1">
            <Field label="Segmento" value={org.industry} />
            <Field label="Porte" value={org.size ? organizationSizeLabel[org.size] : null} />
            <Field label="Site" value={org.website} />
          </div>
        </div>
      ) : null}
    </PanelSection>
  );
}
