import { Card } from "@/components/ui/card";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { PeriodFilterStrip } from "@/components/marketing/period-strip";
import { PerformanceChartMock } from "@/components/marketing/performance-chart";
import { MetricComparison, AttributionCard } from "@/components/marketing/comparison";
import { formatCurrency } from "@/lib/format";
import { channelLabels, channelPerformance, monthlySeries, performanceMetrics } from "@/mocks/marketing/performance";
import { PreviewBanner } from "@/components/ui/preview-banner";

export function PerformanceView() {
  return (
    <div className="flex flex-col gap-5">
      <PreviewBanner feature="A performance de marketing (investimento, receita e atribuição por canal)" />
      <PeriodFilterStrip />

      {/* KPIs completos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {performanceMetrics.map((m) => (
          <Card key={m.id} className="p-4">
            <p className="text-caption font-medium uppercase tracking-wide text-ink-2">{m.label}</p>
            <p className="mt-1 font-display text-h2 font-bold text-ink">{m.value}</p>
            <TrendIndicator value={m.delta} trend={m.trend} className="mt-1" />
          </Card>
        ))}
      </div>

      {/* Gráfico */}
      <Card className="p-5">
        <p className="mb-2 font-display text-h3 font-semibold text-ink">Investimento x Receita</p>
        <PerformanceChartMock data={monthlySeries} />
      </Card>

      {/* Comparativos por canal */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 font-display text-h3 font-semibold text-ink">ROAS por canal</p>
          <MetricComparison
            items={channelPerformance.map((c) => ({
              id: c.channel,
              label: channelLabels[c.channel],
              barValue: c.roas,
              value: `${c.roas}x`,
              sub: formatCurrency(c.revenue),
            }))}
          />
        </Card>
        <Card className="p-5">
          <AttributionCard
            title="Atribuição de receita por canal"
            segments={channelPerformance.map((c) => ({
              id: c.channel,
              label: channelLabels[c.channel],
              value: c.revenue,
              valueLabel: formatCurrency(c.revenue),
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
