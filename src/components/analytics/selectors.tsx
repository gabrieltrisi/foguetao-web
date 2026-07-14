"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CHART_TYPES, type ChartType } from "@/components/analytics/analytics-chart";

export type Option = { id: string; label: string };

/** Seletor de métricas (múltipla escolha). */
export function MetricSelector({ options, selected, onChange }: { options: Option[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line p-1">
      {options.map((o) => (
        <label key={o.id} className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-body2 transition-colors hover:bg-surface", selected.includes(o.id) ? "text-ink" : "text-ink-2")}>
          <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggle(o.id)} aria-label={o.label} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/** Seletor de dimensões (pills selecionáveis). */
export function DimensionSelector({ options, selected, onChange }: { options: Option[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <button key={o.id} type="button" aria-pressed={active} onClick={() => toggle(o.id)} className={cn("inline-flex h-8 items-center rounded-full border px-3 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", active ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white text-ink-2 hover:bg-surface")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Seletor de tipo de gráfico. */
export function ChartTypeSelector({ value, onChange }: { value: ChartType; onChange: (t: ChartType) => void }) {
  return <SegmentedControl options={CHART_TYPES} value={value} onValueChange={onChange} ariaLabel="Tipo de gráfico" />;
}
