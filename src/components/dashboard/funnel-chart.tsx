"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { useSession } from "@/providers/session-provider";
import { useMetricsSummary } from "@/hooks/crm/use-metrics";
import { usePipelineStages } from "@/hooks/crm/use-pipelines";
import { buildFunnel, isFunnelEmpty, periodLabel } from "@/lib/crm/metrics";
import type { MetricsFilters } from "@/types/api/crm-metrics";
import type { PeriodValue } from "@/types";

/**
 * Funil real: contagem por etapa vem de `/metrics/summary` (`byStage`, só deals
 * OPEN) e os nomes das etapas de `/pipelines/:id/stages`. Não há valor por
 * etapa no contrato, então o funil mostra contagem — sem inventar montante.
 *
 * Sem pipeline selecionado, `byStage` mistura etapas de todos os pipelines e
 * não há como nomeá-las; nesse caso pedimos a seleção de um pipeline.
 */
export function FunnelChart({
  filters,
  pipelineId,
  period,
}: {
  filters: MetricsFilters;
  pipelineId: string;
  period: PeriodValue;
}) {
  const { can } = useSession();
  const summary = useMetricsSummary(filters);
  const stages = usePipelineStages(pipelineId);

  const header = (
    <SectionHeader
      title="Funil de vendas"
      description={`Distribuição de oportunidades abertas por etapa ${periodLabel[period]}.`}
      action={
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-0.5 rounded-md text-body2 font-medium text-brand transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Ver pipeline
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      }
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

  if (summary.isLoading || stages.isLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {header}
        <div className="mt-2 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (summary.isError || stages.isError) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p role="alert" className="mt-6 text-body2 text-danger">
          Não foi possível carregar o funil.
        </p>
      </Card>
    );
  }

  if (!pipelineId) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">
          Selecione um pipeline para ver o funil por etapa.
        </p>
      </Card>
    );
  }

  const funnel = summary.data ? buildFunnel(summary.data, stages.data ?? []) : [];

  if (funnel.length === 0) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">Este pipeline não possui etapas abertas.</p>
      </Card>
    );
  }

  if (isFunnelEmpty(funnel)) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">
          Nenhuma oportunidade aberta neste pipeline no período.
        </p>
      </Card>
    );
  }

  // A barra é proporcional à maior etapa (o funil é comparativo, não absoluto).
  const maxCount = Math.max(...funnel.map((stage) => stage.count));

  return (
    <Card className="flex flex-col p-5">
      {header}
      <ul className="mt-5 flex flex-col gap-3">
        {funnel.map((stage) => {
          const width = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-body2 text-ink-2 sm:w-32">
                {stage.label}
              </span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
                <span className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
              </span>
              <span className="w-16 shrink-0 text-right text-small tabular-nums text-ink-2 sm:w-20">
                <span className="font-semibold text-ink">{formatNumber(stage.count)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
