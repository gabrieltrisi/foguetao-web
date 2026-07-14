"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CohortTable } from "@/components/analytics/cohort-table";
import { formatNumber } from "@/lib/format";
import { cohorts, retentionColor } from "@/mocks/analytics/cohorts";

const METRICS = [
  { value: "retencao", label: "Retenção" },
  { value: "recompra", label: "Recompra" },
  { value: "receita", label: "Receita" },
  { value: "engajamento", label: "Engajamento" },
];

const LEGEND = [40, 55, 70, 85, 100];

function avgAt(index: number): number {
  const vals = cohorts.map((c) => c.retention[index]).filter((v): v is number => v !== undefined);
  return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
}

export function CohortsView() {
  const [metric, setMetric] = React.useState("retencao");
  const avgSize = Math.round(cohorts.reduce((s, c) => s + c.size, 0) / cohorts.length);

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl options={METRICS} value={metric} onValueChange={setMetric} ariaLabel="Métrica do cohort" className="w-fit" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Safras" value={String(cohorts.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Retenção M1" value={`${avgAt(1)}%`} delta="+2 pp" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Retenção M3" value={`${avgAt(3)}%`} /></Card>
        <Card className="p-5"><KPIBlock label="Tamanho médio" value={formatNumber(avgSize)} /></Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-h3 font-semibold text-ink">Retenção por safra</p>
          <div className="flex items-center gap-1.5 text-caption text-ink-3">
            <span>Menor</span>
            {LEGEND.map((v) => <span key={v} className={cn("size-4 rounded", retentionColor(v))} aria-hidden />)}
            <span>Maior</span>
          </div>
        </div>
        <CohortTable cohorts={cohorts} />
      </Card>
    </div>
  );
}
