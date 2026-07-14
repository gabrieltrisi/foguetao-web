import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { FunnelStage } from "@/types/analytics";

/** Funil horizontal com contagem, % do topo e perda entre etapas. */
export function FunnelChart({ stages, className }: { stages: FunnelStage[]; className?: string }) {
  const top = stages[0]?.count || 1;

  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {stages.map((stage, i) => {
        const pctTop = Math.round((stage.count / top) * 100);
        const prev = i > 0 ? stages[i - 1].count : stage.count;
        const drop = i > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0;
        const width = Math.max(6, (stage.count / top) * 100);
        return (
          <li key={stage.label}>
            <div className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-body2 text-ink-2 sm:w-32">{stage.label}</span>
              <span className="relative h-8 flex-1 overflow-hidden rounded-lg bg-surface" aria-hidden>
                <span className="flex h-full items-center rounded-lg bg-brand pl-3 text-caption font-semibold text-white" style={{ width: `${width}%` }}>
                  {formatNumber(stage.count)}
                </span>
              </span>
              <span className="w-24 shrink-0 text-right text-small tabular-nums">
                <span className="font-semibold text-ink">{pctTop}%</span>
                <span className="block text-caption text-ink-3">do topo</span>
              </span>
            </div>
            {i > 0 && drop > 0 ? (
              <p className="ml-[8.75rem] mt-0.5 text-caption text-danger sm:ml-[9.75rem]">↓ {drop}% de perda</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
