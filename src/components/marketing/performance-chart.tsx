import { cn } from "@/lib/utils";

type Point = { label: string; invest: number; revenue: number };

/** Gráfico combinado (barras de investimento + linha de receita) — SVG mock. */
export function PerformanceChartMock({ data, className }: { data: Point[]; className?: string }) {
  const W = 720;
  const H = 260;
  const padX = 32;
  const padTop = 20;
  const padBottom = 34;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => Math.max(d.invest, d.revenue))) * 1.15;
  const step = plotW / data.length;
  const barW = Math.min(26, step * 0.4);

  const x = (i: number) => padX + step * i + step / 2;
  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.revenue).toFixed(1)}`)
    .join(" ");

  return (
    <figure className={cn("w-full", className)}>
      <div className="mb-3 flex items-center gap-4 text-caption text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-soft ring-1 ring-brand/30" aria-hidden /> Investimento
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-brand" aria-hidden /> Receita
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gráfico de investimento e receita nos últimos 8 meses"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* grades */}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={W - padX}
            y1={padTop + plotH * g}
            y2={padTop + plotH * g}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
        ))}
        {/* barras */}
        {data.map((d, i) => (
          <rect
            key={d.label}
            x={x(i) - barW / 2}
            y={y(d.invest)}
            width={barW}
            height={padTop + plotH - y(d.invest)}
            rx={4}
            fill="var(--color-brand-soft)"
            stroke="var(--color-brand)"
            strokeOpacity={0.3}
          />
        ))}
        {/* linha receita */}
        <path d={linePath} fill="none" stroke="var(--color-brand)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={d.label} cx={x(i)} cy={y(d.revenue)} r={3.5} fill="#fff" stroke="var(--color-brand)" strokeWidth={2} />
        ))}
        {/* rótulos */}
        {data.map((d, i) => (
          <text key={d.label} x={x(i)} y={H - 12} textAnchor="middle" className="fill-ink-3 text-[11px]">
            {d.label}
          </text>
        ))}
      </svg>
    </figure>
  );
}
