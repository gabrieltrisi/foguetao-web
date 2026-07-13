import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { performanceKpis } from "@/mocks/dashboard";

export function PerformancePanel() {
  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Performance comercial"
        description="Indicadores-chave do time."
      />
      <dl className="mt-5 flex flex-col divide-y divide-line">
        {performanceKpis.map((kpi) => (
          <div key={kpi.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div>
              <dt className="text-small text-ink-2">{kpi.label}</dt>
              <dd className="mt-0.5 font-display text-h3 font-bold text-ink">{kpi.value}</dd>
            </div>
            <TrendIndicator value={kpi.delta} trend={kpi.trend} />
          </div>
        ))}
      </dl>
    </Card>
  );
}
