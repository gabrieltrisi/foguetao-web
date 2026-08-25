import { cn } from "@/lib/utils";

export type ComparisonItem = { id: string; label: string; barValue: number; value: string; sub?: string };

/** Comparativo horizontal (barras) por item/canal. */
export function MetricComparison({ items, className }: { items: ComparisonItem[]; className?: string }) {
  const max = Math.max(...items.map((i) => i.barValue), 1);
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-body2 text-ink-2 sm:w-28">{item.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
            <span className="block h-full rounded-full bg-brand" style={{ width: `${(item.barValue / max) * 100}%` }} />
          </span>
          <span className="w-24 shrink-0 text-right text-small tabular-nums sm:w-28">
            <span className="font-semibold text-ink">{item.value}</span>
            {item.sub ? <span className="block text-caption text-ink-3">{item.sub}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

const SEGMENT_COLORS = ["bg-brand", "bg-info", "bg-success", "bg-warning", "bg-ink", "bg-ink-3"];

/** Card de atribuição — barra segmentada por participação. */
export function AttributionCard({
  title,
  segments,
  className,
}: {
  title: string;
  segments: { id: string; label: string; value: number; valueLabel: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={className}>
      <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">{title}</p>
      <div className="flex h-3 w-full overflow-hidden rounded-full" aria-hidden>
        {segments.map((s, i) => (
          <span key={s.id} className={cn(SEGMENT_COLORS[i % SEGMENT_COLORS.length])} style={{ width: `${(s.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {segments.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 text-body2">
            <span className={cn("size-2.5 shrink-0 rounded-sm", SEGMENT_COLORS[i % SEGMENT_COLORS.length])} aria-hidden />
            <span className="flex-1 text-ink-2">{s.label}</span>
            <span className="font-medium text-ink">{s.valueLabel}</span>
            <span className="w-12 text-right text-caption text-ink-3">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
