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
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/motion";
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
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StaggerItem key={metric.id}>
            <MetricCard metric={metric} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Funil + Performance */}
      <FadeIn className="grid grid-cols-1 gap-4 lg:grid-cols-3" delay={0.05}>
        <div className="lg:col-span-2">
          <FunnelChart />
        </div>
        <PerformancePanel />
      </FadeIn>

      {/* Atividades + Tarefas + Conversas */}
      <FadeIn className="grid grid-cols-1 gap-4 lg:grid-cols-3" delay={0.1}>
        <RecentActivities />
        <PendingTasks />
        <RecentConversations />
      </FadeIn>
    </div>
  );
}
