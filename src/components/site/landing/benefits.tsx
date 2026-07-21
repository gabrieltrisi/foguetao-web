import { TrendingUp, BellRing, Users2, BarChart3, Layers3, Zap } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const BENEFITS = [
  { icon: TrendingUp, title: "Previsibilidade de receita", body: "Saiba o que vai fechar antes do fim do mês — o funil mostra onde está cada real." },
  { icon: BellRing, title: "Follow-up que não escapa", body: "Cada tarefa e cada lembrete no lugar certo. Nenhuma oportunidade esquecida." },
  { icon: Users2, title: "Time na mesma página", body: "Todos veem o mesmo pipeline e os mesmos números. Fim das versões paralelas." },
  { icon: BarChart3, title: "Decisão por dado", body: "Métricas ao vivo em vez de planilha de ontem. Ajuste a rota na hora certa." },
  { icon: Layers3, title: "Menos ferramentas", body: "Uma plataforma no lugar de cinco abas abertas. Tudo conversa entre si." },
  { icon: Zap, title: "Velocidade no dia a dia", body: "Menos tempo organizando, mais tempo vendendo. A rotina fica leve." },
];

export function LandingBenefits() {
  return (
    <Section id="beneficios">
      <SectionHeader
        eyebrow="Benefícios"
        title={<>O que muda na sua rotina.</>}
        subtitle="Não é sobre mais uma ferramenta. É sobre operar com clareza e vender com consistência."
      />
      <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b, i) => {
          const Icon = b.icon;
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
