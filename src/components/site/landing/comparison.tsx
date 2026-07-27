import { Check, Minus, X } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Level = "yes" | "partial" | "no";

const COLS = ["Planilhas", "CRM tradicional", "Foguetão"] as const;

const ROWS: { label: string; values: [Level, Level, Level] }[] = [
  { label: "Funil de vendas em tempo real", values: ["no", "partial", "yes"] },
  { label: "Follow-up organizado", values: ["no", "yes", "yes"] },
  { label: "Time na mesma base", values: ["partial", "yes", "yes"] },
  { label: "Rápido de implantar", values: ["yes", "no", "yes"] },
  { label: "Simples no dia a dia", values: ["partial", "no", "yes"] },
  { label: "Multiempresa e permissões", values: ["no", "partial", "yes"] },
  { label: "Feito para o Brasil, em português", values: ["partial", "partial", "yes"] },
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
        title={<>Por que trocar.</>}
        subtitle="Planilha resolve no começo. CRM tradicional trava com complexidade. O Foguetão fica no ponto certo entre simples e completo."
        align="center"
      />

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.01]">
          {/* Em telas estreitas a tabela rola na horizontal (min-width) em vez de
              espremer as 4 colunas; a partir de sm ela ocupa a largura toda. */}
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[520px] sm:min-w-0">
              {/* Cabeçalho */}
              <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] items-center border-b border-white/[0.07] px-4 py-4 sm:px-6">
                <span className="text-[12px] font-medium uppercase tracking-wide text-white/40">Recurso</span>
                {COLS.map((c) => (
                  <span
                    key={c}
                    className={cn(
                      "text-center text-[12.5px] font-semibold sm:text-[13.5px]",
                      c === "Foguetão" ? "text-brand" : "text-white/55",
                    )}
                  >
                    {c}
                  </span>
                ))}
              </div>
              {/* Linhas */}
              {ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "grid grid-cols-[1.6fr_repeat(3,1fr)] items-center px-4 py-3.5 sm:px-6",
                    i % 2 === 1 && "bg-white/[0.015]",
                  )}
                >
                  <span className="pr-3 text-[13px] text-white/70 sm:text-[14px]">{row.label}</span>
                  {row.values.map((v, j) => (
                    <span key={j} className="flex justify-center">
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
