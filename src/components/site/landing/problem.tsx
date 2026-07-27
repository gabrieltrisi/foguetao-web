import { TrendingUp, BellRing, Users2, BarChart3, Layers3, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import type { BenefitIconKey, ProblemItem } from "@/config/landing/segments";

/** Mapa chave→ícone (dados de segmento carregam só a string). */
const ICONS: Record<BenefitIconKey, LucideIcon> = {
  trendingUp: TrendingUp,
  bell: BellRing,
  users: Users2,
  chart: BarChart3,
  layers: Layers3,
  zap: Zap,
};

/** Seção "Problema" — dores do segmento (personalizadas por nicho). */
export function LandingProblem({ problems }: { problems: ProblemItem[] }) {
  return (
    <Section id="problema">
      <SectionHeader
        eyebrow="O problema"
        title={<>Vender no escuro custa caro.</>}
        subtitle="Planilha aqui, anotação ali, conversa em outro lugar. Quando a informação está espalhada, oportunidade vira esquecimento — e receita vira estimativa."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((p, i) => {
          const Icon = ICONS[p.icon];
          return (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.03]">
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/50">{p.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
