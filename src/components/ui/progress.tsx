import { cn } from "@/lib/utils";

const TONE_BAR = {
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-fg-muted",
} as const;

export type ProgressTone = keyof typeof TONE_BAR;

/**
 * Barra de progresso acessível do design system. `value` é 0–100 (clampado).
 * Reutilizável (execução de campanhas, limites, etc.).
 */
export function Progress({
  value,
  tone = "brand",
  label,
  className,
}: {
  value: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all", TONE_BAR[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
