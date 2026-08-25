"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodFilter } from "@/components/ui/period-filter";
import { Combobox } from "@/components/ui/combobox";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { MetricCardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { PerformancePanel } from "@/components/dashboard/performance-panel";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { useSession } from "@/providers/session-provider";
import { useMetricsSummary } from "@/hooks/crm/use-metrics";
import { usePipelines } from "@/hooks/crm/use-pipelines";
import { buildMetrics, isSummaryEmpty, periodToRange } from "@/lib/crm/metrics";
import { periodOptions } from "@/lib/period";
import type { PeriodValue } from "@/types";

const ALL_PIPELINES = "__all__";

export function DashboardView() {
  const { can } = useSession();
  const [period, setPeriod] = React.useState<PeriodValue>("7d");
  const [pipeline, setPipeline] = React.useState<string>(ALL_PIPELINES);

  const canReadMetrics = can("crm.metrics.read");
  const pipelines = usePipelines({ limit: 50 });

  // O período vira a janela real do contrato (from/to sobre createdAt).
  const filters = React.useMemo(() => {
    const range = periodToRange(period);
    return pipeline === ALL_PIPELINES ? range : { ...range, pipelineId: pipeline };
  }, [period, pipeline]);

  const summary = useMetricsSummary(filters);
  const pipelineId = pipeline === ALL_PIPELINES ? "" : pipeline;

  const header = (
    <PageHeader
      title="Visão geral"
      description="Acompanhe os principais resultados da sua operação."
      actions={
        <>
          {canReadMetrics ? (
            <div className="w-44">
              <Combobox
                options={[
                  { value: ALL_PIPELINES, label: "Todos os pipelines" },
                  ...(pipelines.data?.items ?? []).map((p) => ({ value: p.id, label: p.name })),
                ]}
                value={pipeline}
                onValueChange={setPipeline}
              />
            </div>
          ) : null}
          <PeriodFilter options={periodOptions} value={period} onValueChange={setPeriod} />
          {can("crm.deals.create") ? (
            <Button asChild size="sm">
              <Link href="/deals/new">
                <Plus />
                Nova oportunidade
              </Link>
            </Button>
          ) : null}
        </>
      }
    />
  );

  return (
    <div className="flex flex-col gap-5">
      {header}

      {/* KPIs — exclusivamente de /metrics/summary */}
      {!canReadMetrics ? (
        <Card className="p-8 text-center">
          <p className="text-body2 text-ink-3">
            Você não tem permissão para ver as métricas comerciais.
          </p>
        </Card>
      ) : summary.isError ? (
        <ErrorState
          variant="card"
          title="Não foi possível carregar as métricas."
          onRetry={() => summary.refetch()}
        />
      ) : summary.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : summary.data && isSummaryEmpty(summary.data) ? (
        <Card className="p-8 text-center">
          <p className="text-body2 font-medium text-ink">Nenhuma oportunidade no período.</p>
          <p className="mt-1 text-body2 text-ink-3">
            Ajuste o período ou o pipeline, ou crie a primeira oportunidade.
          </p>
        </Card>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {buildMetrics(summary.data!).map((metric) => (
            <StaggerItem key={metric.id}>
              <MetricCard metric={metric} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Funil + Performance */}
      <FadeIn className="grid grid-cols-1 gap-4 lg:grid-cols-3" delay={0.05}>
        <div className="lg:col-span-2">
          <FunnelChart filters={filters} pipelineId={pipelineId} period={period} />
        </div>
        <PerformancePanel filters={filters} period={period} />
      </FadeIn>

      {/* Atividades + Tarefas (dados reais) */}
      <FadeIn className="grid grid-cols-1 gap-4 lg:grid-cols-2" delay={0.1}>
        <RecentActivities />
        <PendingTasks />
      </FadeIn>
    </div>
  );
}
