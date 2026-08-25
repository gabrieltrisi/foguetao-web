"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/providers/session-provider";
import { useDeals } from "@/hooks/crm/use-deals";
import { usePipelineStages } from "@/hooks/crm/use-pipelines";
import { PanelSection } from "./panel-section";

const DEAL_STATUS_TONE: Record<string, "info" | "success" | "danger" | "neutral"> = {
  OPEN: "info",
  WON: "success",
  LOST: "danger",
  ARCHIVED: "neutral",
};

function money(value: string, currency: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return `${value} ${currency}`;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toLocaleString("pt-BR")} ${currency}`;
  }
}

/**
 * Card NEGÓCIOS (F6). `useDeals({contactId})` (filtro server-side). Só leitura +
 * "Abrir no CRM". Etapa/probabilidade vêm do STAGE (o deal não tem probability) —
 * resolvido best-effort para o pipeline do 1º negócio (comum: pipeline único).
 */
export function DealsCard({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const denied = !can("crm.deals.read");
  const q = useDeals({ contactId });
  const deals = q.data?.items ?? [];
  const primaryPipeline = deals[0]?.pipelineId;
  const stagesQ = usePipelineStages(primaryPipeline ?? "");
  const stageById = React.useMemo(() => {
    const m = new Map<string, { name: string; probability: number | null }>();
    (stagesQ.data ?? []).forEach((s) => m.set(s.id, { name: s.name, probability: s.probability }));
    return m;
  }, [stagesQ.data]);

  return (
    <PanelSection
      title="Negócios"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && deals.length === 0}
      emptyLabel="Nenhum negócio."
      onRetry={() => void q.refetch()}
    >
      <ul className="space-y-2">
        {deals.map((d) => {
          const stage = stageById.get(d.stageId);
          const tone = DEAL_STATUS_TONE[d.status] ?? "neutral";
          return (
            <li key={d.id} className="rounded-lg border border-line p-2">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-caption font-medium text-ink">{d.title}</p>
                <Link
                  href={`/deals/${d.id}`}
                  aria-label={`Abrir negócio ${d.title} no CRM`}
                  className="shrink-0 text-ink-3 hover:text-brand"
                >
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-micro text-ink-3">
                <span className="font-semibold text-ink">{money(d.value, d.currency)}</span>
                <Badge tone={tone}>{d.status}</Badge>
                {stage ? <span>· {stage.name}</span> : null}
                {stage?.probability != null ? <span>· {stage.probability}%</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
