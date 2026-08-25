import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ForecastScenario } from "@/types/analytics";

const toneStyle: Record<ForecastScenario["tone"], { bar: string; text: string }> = {
  success: { bar: "bg-success", text: "text-success" },
  info: { bar: "bg-brand", text: "text-brand" },
  danger: { bar: "bg-danger", text: "text-danger" },
};

/** Card de cenário de forecast. */
export function ForecastCard({ scenario, max }: { scenario: ForecastScenario; max: number }) {
  const s = toneStyle[scenario.tone];
  const pct = Math.round((scenario.value / max) * 100);
  return (
    <Card className="p-5">
      <p className="text-caption font-medium uppercase tracking-wide text-ink-2">{scenario.label}</p>
      <p className={cn("mt-1 font-display text-h1 font-bold", s.text)}>{formatCurrency(scenario.value)}</p>
      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
        <span className={cn("block h-full rounded-full", s.bar)} style={{ width: `${pct}%` }} />
      </span>
    </Card>
  );
}
