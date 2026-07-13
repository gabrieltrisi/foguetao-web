import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { SimpleTooltip, TooltipProvider } from "@/components/ui/tooltip";
import type { Metric } from "@/types";

/**
 * Metric card — label (uppercase) + valor em Sora + delta de tendência.
 * Fiel às páginas 5, 8, 9 e 10 do design reference.
 */
export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-caption font-medium uppercase tracking-wide text-ink-2">{metric.label}</p>
        {metric.hint ? (
          <TooltipProvider delayDuration={200}>
            <SimpleTooltip label={metric.hint}>
              <button
                type="button"
                className="text-ink-3 transition-colors hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                aria-label={`Sobre ${metric.label}`}
              >
                <Info className="size-4" aria-hidden />
              </button>
            </SimpleTooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <p className="mt-2 font-display text-h1 font-bold text-ink">{metric.value}</p>
      <div className="mt-2 flex items-center gap-1">
        <TrendIndicator value={metric.deltaPercent} trend={metric.trend} />
        <span className="text-small text-ink-3">vs. período anterior</span>
      </div>
    </Card>
  );
}
