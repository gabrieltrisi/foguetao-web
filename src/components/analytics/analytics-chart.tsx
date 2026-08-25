import { cn } from "@/lib/utils";

export type ChartType = "line" | "area" | "bar";
type Point = { label: string; value: number };

/** Gráfico de série única em SVG (linha, área ou barra). Mock leve, sem lib. */
export function AnalyticsChartMock({
  data,
  type = "line",
  ariaLabel = "Gráfico",
  className,
}: {
  data: Point[];
  type?: ChartType;
  ariaLabel?: string;
  className?: string;
}) {
  const W = 720;
  const H = 260;
  const padX = 32;
  const padTop = 16;
  const padBottom = 34;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  const step = plotW / data.length;
  const barW = Math.min(30, step * 0.55);

  const x = (i: number) => padX + step * i + step / 2;
  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${padTop + plotH} L ${x(0)} ${padTop + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-auto w-full", className)} role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={padX} x2={W - padX} y1={padTop + plotH * g} y2={padTop + plotH * g} stroke="var(--color-line)" strokeWidth={1} />
      ))}

      {type === "bar"
        ? data.map((d, i) => (
            <rect key={d.label} x={x(i) - barW / 2} y={y(d.value)} width={barW} height={padTop + plotH - y(d.value)} rx={5} fill="var(--color-brand)" />
          ))
        : null}

      {type === "area" ? <path d={areaPath} fill="var(--color-brand-soft)" opacity={0.7} /> : null}

      {type !== "bar" ? (
        <>
          <path d={linePath} fill="none" stroke="var(--color-brand)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) => (
            <circle key={d.label} cx={x(i)} cy={y(d.value)} r={3.5} fill="#fff" stroke="var(--color-brand)" strokeWidth={2} />
          ))}
        </>
      ) : null}

      {data.map((d, i) => (
        <text key={d.label} x={x(i)} y={H - 12} textAnchor="middle" className="fill-ink-3 text-[11px]">{d.label}</text>
      ))}
    </svg>
  );
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "line", label: "Linha" },
  { value: "area", label: "Área" },
  { value: "bar", label: "Barra" },
];

export { CHART_TYPES };
