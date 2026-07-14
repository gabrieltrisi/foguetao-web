"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { MetricComparison } from "@/components/marketing/comparison";
import { formatNumber } from "@/lib/format";
import { funnels } from "@/mocks/analytics/funnels";

export function FunnelsView() {
  const [id, setId] = React.useState(funnels[0].id);
  const funnel = funnels.find((f) => f.id === id) ?? funnels[0];
  const top = funnel.stages[0]?.count ?? 0;
  const base = funnel.stages[funnel.stages.length - 1]?.count ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl options={funnels.map((f) => ({ value: f.id, label: f.name }))} value={id} onValueChange={setId} ariaLabel="Selecionar funil" className="w-fit" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Conversão" value={`${funnel.conversion}%`} delta="+0,8 pp" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Tempo médio" value={funnel.avgTime} /></Card>
        <Card className="p-5"><KPIBlock label="Topo do funil" value={formatNumber(top)} /></Card>
        <Card className="p-5"><KPIBlock label="Base do funil" value={formatNumber(base)} /></Card>
      </div>

      <Card className="p-5">
        <p className="mb-4 font-display text-h3 font-semibold text-ink">{funnel.name}</p>
        <FunnelChart stages={funnel.stages} />
      </Card>

      <Card className="p-5">
        <p className="mb-4 font-display text-h3 font-semibold text-ink">Comparação entre funis</p>
        <MetricComparison items={funnels.map((f) => ({ id: f.id, label: f.name, barValue: f.conversion, value: `${f.conversion}%`, sub: f.avgTime }))} />
      </Card>
    </div>
  );
}
