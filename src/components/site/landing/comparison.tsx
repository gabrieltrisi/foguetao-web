import { Check, Minus, X, Table2, MessageSquare, LayoutGrid, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Level = "yes" | "partial" | "no";

const COLS: { label: string; icon: LucideIcon; strong?: boolean }[] = [
  { label: "Planilha", icon: Table2 },
  { label: "WhatsApp", icon: MessageSquare },
  { label: "CRM", icon: LayoutGrid },
  { label: "Foguetão", icon: Rocket, strong: true },
];

// Leitura rápida. Valores na ordem [Planilha, WhatsApp, CRM tradicional, Foguetão].
const ROWS: { label: string; values: [Level, Level, Level, Level] }[] = [
  { label: "Funil de vendas em tempo real", values: ["no", "no", "yes", "yes"] },
  { label: "Follow-up que não escapa", values: ["partial", "partial", "yes", "yes"] },
  { label: "Histórico do cliente num lugar", values: ["partial", "partial", "yes", "yes"] },
  { label: "Time na mesma base", values: ["partial", "no", "yes", "yes"] },
  { label: "Visão do que vai fechar", values: ["no", "no", "yes", "yes"] },
  { label: "Rápido de implantar", values: ["yes", "yes", "no", "yes"] },
  { label: "Simples no dia a dia", values: ["partial", "yes", "no", "yes"] },
  { label: "Feito para o Brasil, em português", values: ["partial", "partial", "partial", "yes"] },
];

const LEVEL_LABEL: Record<Level, string> = { yes: "Sim", partial: "Parcial", no: "Não" };

function Mark({ level, strong }: { level: Level; strong?: boolean }) {
  const label = LEVEL_LABEL[level];
  if (level === "yes")
    return (
      <span
        title={label}
        className={cn("inline-flex size-6 items-center justify-center rounded-full", strong ? "bg-brand text-white" : "bg-white/10 text-white")}
      >
        <Check className="size-3.5" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  if (level === "partial")
    return (
      <span title={label} className="inline-flex size-6 items-center justify-center rounded-full bg-white/5 text-white/40">
        <Minus className="size-3.5" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  return (
    <span title={label} className="inline-flex size-6 items-center justify-center text-white/20">
      <X className="size-3.5" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LandingComparison({ note }: { note?: string }) {
  return (
    <Section id="comparativo">
      <SectionHeader
        eyebrow="Comparativo"
        title={<>Planilha, WhatsApp, CRM ou o funil certo.</>}
        subtitle={
          note ??
          "Planilha e WhatsApp resolvem no começo; o CRM tradicional trava com complexidade. O Foguetão fica no ponto entre simples e completo — veja de um relance."
        }
        align="center"
      />

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          {/* Em telas estreitas a tabela rola na horizontal (min-width). */}
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-0">
              {/* Cabeçalho */}
              <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] items-center border-b border-white/[0.07]">
                <span className="px-4 py-4 text-[12px] font-medium uppercase tracking-wide text-white/40 sm:px-6">
                  Recurso
                </span>
                {COLS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <span key={c.label} className={cn("flex flex-col items-center gap-1.5 py-4", c.strong && "bg-brand/[0.05]")}>
                      <Icon className={cn("size-4", c.strong ? "text-brand" : "text-white/40")} aria-hidden />
                      <span className={cn("text-[12px] font-semibold sm:text-[13px]", c.strong ? "text-brand" : "text-white/55")}>
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
                  className={cn("grid grid-cols-[1.4fr_repeat(4,1fr)] items-center", i % 2 === 1 && "bg-white/[0.015]")}
                >
                  <span className="px-4 py-3.5 pr-3 text-[13px] text-white/70 sm:px-6 sm:text-[14px]">{row.label}</span>
                  {row.values.map((v, j) => (
                    <span key={j} className={cn("flex justify-center py-3.5", j === 3 && "bg-brand/[0.05]")}>
                      <Mark level={v} strong={j === 3} />
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
