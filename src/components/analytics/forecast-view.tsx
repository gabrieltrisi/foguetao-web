import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ForecastCard } from "@/components/analytics/forecast-card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { forecastReps, forecastScenarios, forecastSummary, forecastTarget } from "@/mocks/analytics/forecast";

export function ForecastView() {
  const maxScenario = Math.max(...forecastScenarios.map((s) => s.value));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Oportunidades" value={formatNumber(forecastSummary.openDeals)} /></Card>
        <Card className="p-5"><KPIBlock label="Valor em aberto" value={formatCurrency(forecastSummary.openValue)} /></Card>
        <Card className="p-5"><KPIBlock label="Previsão ponderada" value={formatCurrency(forecastSummary.weightedValue)} delta="+9%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Gap para meta" value={forecastSummary.gapLabel} /></Card>
      </div>

      {/* Cenários */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {forecastScenarios.map((s) => <ForecastCard key={s.label} scenario={s} max={maxScenario} />)}
      </div>

      {/* Atingimento da meta */}
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-display text-h3 font-semibold text-ink">Atingimento da meta</p>
          <span className="text-body2 text-ink-2">{formatCurrency(forecastSummary.weightedValue)} de {formatCurrency(forecastTarget)}</span>
        </div>
        <span className="relative block h-4 overflow-hidden rounded-full bg-surface" aria-hidden>
          <span className="block h-full rounded-full bg-brand" style={{ width: `${forecastSummary.attainment}%` }} />
        </span>
        <p className="mt-2 text-caption text-ink-3"><span className="font-semibold text-ink">{forecastSummary.attainment}%</span> da meta · faltam {forecastSummary.gapLabel}</p>
      </Card>

      {/* Por responsável */}
      <Card className="overflow-hidden p-0">
        <p className="border-b border-line px-4 py-3 font-display text-h3 font-semibold text-ink">Forecast por responsável</p>
        <TableContainer className="border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Em aberto</TableHead>
                <TableHead className="text-right">Ponderado</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead>Atingimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastReps.map((r) => {
                const pct = Math.round((r.weighted / r.target) * 100);
                return (
                  <TableRow key={r.id}>
                    <TableCell><span className="inline-flex items-center gap-2 font-medium"><EntityAvatar name={r.owner} size="sm" />{r.owner}</span></TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(r.open)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.weighted)}</TableCell>
                    <TableCell className="text-right tabular-nums text-ink-3">{formatCurrency(r.target)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface" aria-hidden><span className={cn("block h-full rounded-full", pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger")} style={{ width: `${Math.min(100, pct)}%` }} /></span>
                        <span className="tabular-nums text-ink-2">{pct}%</span>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
}
