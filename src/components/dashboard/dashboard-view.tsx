"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodFilter } from "@/components/ui/period-filter";
import { MetricCard } from "@/components/ui/metric-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { PerformancePanel } from "@/components/dashboard/performance-panel";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { RecentConversations } from "@/components/dashboard/recent-conversations";
import { dashboardMetrics, periodOptions } from "@/mocks/dashboard";
import type { PeriodValue } from "@/types";

export function DashboardView() {
  const [period, setPeriod] = React.useState<PeriodValue>("7d");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Visão geral"
        description="Acompanhe os principais resultados da sua operação."
        actions={
          <>
            <PeriodFilter options={periodOptions} value={period} onValueChange={setPeriod} />
            <Button size="sm">
              <Plus />
              Nova oportunidade
            </Button>
          </>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Funil + Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FunnelChart />
        </div>
        <PerformancePanel />
      </div>

      {/* Atividades + Tarefas + Conversas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentActivities />
        <PendingTasks />
        <RecentConversations />
      </div>
    </div>
  );
}
