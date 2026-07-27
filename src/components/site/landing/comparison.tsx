import { Check, Minus, X, Table2, MessageSquare, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Level = "yes" | "partial" | "no";

const COLS: { label: string; icon: LucideIcon; strong?: boolean }[] = [
  { label: "Planilha", icon: Table2 },
  { label: "WhatsApp", icon: MessageSquare },
  { label: "Foguetão", icon: Rocket, strong: true },
];

// Leitura rápida: rótulos curtos + marcas. Valores na ordem [Planilha, WhatsApp, Foguetão].
const ROWS: { label: string; values: [Level, Level, Level] }[] = [
  { label: "Funil de vendas em tempo real", values: ["no", "no", "yes"] },
  { label: "Follow-up que não escapa", values: ["partial", "partial", "yes"] },
  { label: "Histórico do cliente num lugar", values: ["partial", "partial", "yes"] },
  { label: "Time na mesma base", values: ["partial", "no", "yes"] },
  { label: "Visão do que vai fechar", values: ["no", "no", "yes"] },
  { label: "Rápido no dia a dia", values: ["partial", "yes", "yes"] },
  { label: "Cresce com o time", values: ["no", "no", "yes"] },
];

function Mark({ level, strong }: { level: Level; strong?: boolean }) {
  if (level === "yes")
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full", strong ? "bg-brand text-white" : "bg-white/10 text-white")}>
        <Check className="size-3.5" aria-hidden />
        <span className="sr-only">Sim</span>
      </span>
    );
  if (level === "partial")
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/5 text-white/40">
        <Minus className="size-3.5" aria-hidden />
        <span className="sr-only">Parcial</span>
      </span>
    );
  return (
    <span className="inline-flex size-6 items-center justify-center text-white/20">
      <X className="size-3.5" aria-hidden />
      <span className="sr-only">Não</span>
    </span>
  );
}

export function LandingComparison() {
  return (
    <Section id="comparativo">
      <SectionHeader
        eyebrow="Comparativo"
        title={<>Planilha, WhatsApp ou um funil de verdade.</>}
        subtitle="Planilha e WhatsApp resolvem no começo — mas travam quando o volume e o time crescem. Veja a diferença de um relance."
        align="center"
      />

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          {/* Em telas estreitas a tabela rola na horizontal (min-width) em vez de
              espremer as colunas; a partir de sm ela ocupa a largura toda. */}
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[520px] sm:min-w-0">
              {/* Cabeçalho — colunas com ícone; a do Foguetão é destacada. */}
              <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] items-center border-b border-white/[0.07]">
                <span className="px-4 py-4 text-[12px] font-medium uppercase tracking-wide text-white/40 sm:px-6">
                  Recurso
                </span>
                {COLS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <span
                      key={c.label}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-4",
                        c.strong && "bg-brand/[0.05]",
                      )}
                    >
                      <Icon className={cn("size-4", c.strong ? "text-brand" : "text-white/40")} aria-hidden />
                      <span className={cn("text-[12.5px] font-semibold sm:text-[13.5px]", c.strong ? "text-brand" : "text-white/55")}>
                        {c.label}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Linhas */}
              {ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "grid grid-cols-[1.6fr_repeat(3,1fr)] items-center",
                    i % 2 === 1 && "bg-white/[0.015]",
                  )}
                >
                  <span className="px-4 py-3.5 pr-3 text-[13px] text-white/70 sm:px-6 sm:text-[14px]">
                    {row.label}
                  </span>
                  {row.values.map((v, j) => (
                    <span key={j} className={cn("flex justify-center py-3.5", j === 2 && "bg-brand/[0.05]")}>
                      <Mark level={v} strong={j === 2} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
