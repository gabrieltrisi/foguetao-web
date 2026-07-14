import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { usagePercent, usageTone } from "@/mocks/admin/limits";
import type { UsageLimit } from "@/types/admin";

const toneBar: Record<"brand" | "warning" | "danger", string> = {
  brand: "bg-brand",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Barra de progresso acessível para consumo de limite. */
export function UsageProgress({
  value,
  tone = "brand",
  label,
  className,
}: {
  value: number;
  tone?: "brand" | "warning" | "danger";
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}
    >
      <div className={cn("h-full rounded-full transition-all", toneBar[tone])} style={{ width: `${value}%` }} />
    </div>
  );
}

function formatUsage(v: number, unit?: string): string {
  if (unit) return `${formatNumber(v)} ${unit}`;
  return formatNumber(v);
}

/** Card de uso de um limite (rótulo, uso/total, barra e %). */
export function UsageCard({ limit }: { limit: UsageLimit }) {
  const percent = usagePercent(limit);
  const tone = usageTone(percent);
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-body2 font-semibold text-ink">{limit.label}</p>
        <p className={cn("text-caption font-semibold tabular-nums", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-ink-2")}>
          {percent}%
        </p>
      </div>
      <UsageProgress value={percent} tone={tone} label={`${limit.label}: ${percent}% usado`} />
      <p className="text-caption text-ink-3 tabular-nums">
        {formatUsage(limit.used, limit.unit)} de {formatUsage(limit.total, limit.unit)}
      </p>
    </Card>
  );
}
