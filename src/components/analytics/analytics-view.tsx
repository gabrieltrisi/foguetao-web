"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PeriodFilterStrip } from "@/components/marketing/period-strip";
import { MetricComparison } from "@/components/marketing/comparison";
import { AnalyticsChartMock, type ChartType } from "@/components/analytics/analytics-chart";
import { ChartTypeSelector } from "@/components/analytics/selectors";
import { formatCurrency } from "@/lib/format";
import { analyticsKpis, byCampaign, byChannel, byOwner, revenueSeries } from "@/mocks/analytics/analytics";

const COMPARE = [
  { value: "canal", label: "Por canal" },
  { value: "campanha", label: "Por campanha" },
  { value: "responsavel", label: "Por responsável" },
];

export function AnalyticsView() {
  const [chart, setChart] = React.useState<ChartType>("line");
  const [compare, setCompare] = React.useState("canal");

  const data = compare === "canal" ? byChannel : compare === "campanha" ? byCampaign : byOwner;

  return (
    <div className="flex flex-col gap-5">
      <PeriodFilterStrip />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {analyticsKpis.map((m) => (
          <Card key={m.id} className="p-4">
            <p className="text-caption font-medium uppercase tracking-wide text-ink-2">{m.label}</p>
            <p className="mt-1 font-display text-h2 font-bold text-ink">{m.value}</p>
            <TrendIndicator value={m.delta} trend={m.trend} className="mt-1" />
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-h3 font-semibold text-ink">Receita ao longo do tempo</p>
          <ChartTypeSelector value={chart} onChange={setChart} />
        </div>
        <AnalyticsChartMock data={revenueSeries} type={chart} ariaLabel="Receita ao longo do tempo" />
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-h3 font-semibold text-ink">Comparativo</p>
          <SegmentedControl size="sm" options={COMPARE} value={compare} onValueChange={setCompare} ariaLabel="Comparar por" />
        </div>
        <MetricComparison items={data.map((d) => ({ id: d.id, label: d.label, barValue: d.current, value: d.valueLabel, sub: `ant.: ${formatCurrency(d.previous)}` }))} />
      </Card>
    </div>
  );
}
