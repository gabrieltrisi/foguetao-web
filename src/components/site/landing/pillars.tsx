import { Layers, Activity, ShieldCheck } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const PILLARS = [
  {
    icon: Layers,
    title: "Centralize tudo",
    body: "Contatos, negócios, tarefas e campanhas em um só lugar. Nada se perde, tudo tem contexto — e o histórico fica sempre a um clique.",
  },
  {
    icon: Activity,
    title: "Enxergue em tempo real",
    body: "Mova um negócio no funil e os números mudam na hora. Você decide com dado ao vivo, não com a planilha de ontem.",
  },
  {
    icon: ShieldCheck,
    title: "Cresça com controle",
    body: "Multiempresa, papéis e permissões. O time aumenta, os canais crescem — e a operação continua organizada.",
  },
];

export function LandingPillars() {
  return (
    <Section id="solucao">
      <SectionHeader
        eyebrow="Como o Foguetão resolve"
        title={<>Uma base sólida para crescer com controle.</>}
        subtitle="Três fundamentos que transformam uma operação improvisada em uma máquina comercial previsível."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {PILLARS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-7 transition duration-200 hover:-translate-y-0.5 hover:border-white/15">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-white">{p.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-white/55">{p.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
