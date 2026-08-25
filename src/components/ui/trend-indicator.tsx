import { cn } from "@/lib/utils";
import { formatPercentDelta } from "@/lib/format";
import type { Trend } from "@/types";

const trendGlyph: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  flat: "→",
};

/**
 * Indicador de tendência (delta %) com seta e cor semântica.
 * `trend` controla a cor; o sinal do valor controla a seta padrão.
 */
export function TrendIndicator({
  value,
  trend,
  suffix,
  className,
}: {
  /** Valor numérico (%) OU texto já formatado. */
  value: number | string;
  trend: Trend;
  suffix?: string;
  className?: string;
}) {
  const label = typeof value === "number" ? formatPercentDelta(value) : value;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-small font-semibold",
        trend === "up" && "text-success",
        trend === "down" && "text-danger",
        trend === "flat" && "text-ink-2",
        className,
      )}
    >
      <span aria-hidden>{trendGlyph[trend]}</span>
      <span>{label}</span>
      {suffix ? <span className="font-normal text-ink-3">{suffix}</span> : null}
    </span>
  );
}
