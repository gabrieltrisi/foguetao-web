"use client";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { useSession } from "@/providers/session-provider";
import { useMetricsSummary } from "@/hooks/crm/use-metrics";
import { buildPerformanceKpis, periodLabel } from "@/lib/crm/metrics";
import type { MetricsFilters } from "@/types/api/crm-metrics";
import type { PeriodValue } from "@/types";

/**
 * Valores comerciais por status, distribuídos POR MOEDA — exatamente como o
 * backend soma. Sem delta/tendência: `/metrics/summary` não compara períodos,
 * e inventar a variação seria mentir.
 */
export function PerformancePanel({
  filters,
  period,
}: {
  filters: MetricsFilters;
  period: PeriodValue;
}) {
  const { can } = useSession();
  const { data, isLoading, isError } = useMetricsSummary(filters);

  const header = (
    <SectionHeader
      title="Performance comercial"
      description={`Valores ${periodLabel[period]}, por moeda.`}
    />
  );

  if (!can("crm.metrics.read")) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">
          Você não tem permissão para ver as métricas comerciais.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {header}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p role="alert" className="mt-6 text-body2 text-danger">
          Não foi possível carregar a performance.
        </p>
      </Card>
    );
  }

  const kpis = buildPerformanceKpis(data);

  return (
    <Card className="flex flex-col p-5">
      {header}
      <dl className="mt-5 flex flex-col divide-y divide-line">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <dt className="text-small text-ink-2">{kpi.label}</dt>
              <dd className="mt-0.5 break-words font-display text-h3 font-bold text-ink">
                {kpi.value}
              </dd>
            </div>
            {/* Só exibe tendência se o contrato fornecer — hoje, nunca. */}
            {kpi.delta !== undefined && kpi.trend ? (
              <TrendIndicator value={kpi.delta} trend={kpi.trend} />
            ) : null}
          </div>
        ))}
      </dl>
    </Card>
  );
}
