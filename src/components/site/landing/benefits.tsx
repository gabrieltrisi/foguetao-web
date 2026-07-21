import { TrendingUp, BellRing, Users2, BarChart3, Layers3, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";
import type { BenefitIconKey, BenefitItem } from "@/config/landing/segments";

/** Mapa chave→ícone: os dados de segmento carregam só a string (sem React). */
const BENEFIT_ICONS: Record<BenefitIconKey, LucideIcon> = {
  trendingUp: TrendingUp,
  bell: BellRing,
  users: Users2,
  chart: BarChart3,
  layers: Layers3,
  zap: Zap,
};

export function LandingBenefits({ benefits }: { benefits: BenefitItem[] }) {
  return (
    <Section id="beneficios">
      <SectionHeader
        eyebrow="Benefícios"
        title={<>O que muda na sua rotina.</>}
        subtitle="Não é sobre mais uma ferramenta. É sobre operar com clareza e vender com consistência."
      />
      <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => {
          const Icon = BENEFIT_ICONS[b.icon];
          return (
            <Reveal key={b.title} delay={(i % 3) * 0.06}>
              <div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[16px] font-semibold text-white">{b.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/50">{b.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
