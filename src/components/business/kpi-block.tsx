import { cn } from "@/lib/utils";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import type { Trend } from "@/types";

/** Bloco de KPI compacto (rótulo + valor + tendência). */
export function KPIBlock({
  label,
  value,
  delta,
  trend,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-caption font-medium uppercase tracking-wide text-ink-2">{label}</span>
      <span className="font-display text-h2 font-bold text-ink">{value}</span>
      {delta && trend ? <TrendIndicator value={delta} trend={trend} /> : null}
    </div>
  );
}

/** Lista de estatísticas (rótulo → valor). */
export function StatList({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-body2 text-ink-2">{item.label}</dt>
          <dd className="text-body2 font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
