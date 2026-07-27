import { Snowflake, LineChart, Users, Clock } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const PAINS = [
  {
    icon: Snowflake,
    title: "Leads que esfriam",
    body: "Sem um lugar único, o follow-up escapa — e o cliente fecha com quem respondeu primeiro.",
  },
  {
    icon: LineChart,
    title: "Receita imprevisível",
    body: "Sem pipeline claro, você só descobre o resultado do mês quando ele já acabou.",
  },
  {
    icon: Users,
    title: "Time desalinhado",
    body: "Cada vendedor com sua planilha. Ninguém enxerga o todo, ninguém fala a mesma língua.",
  },
  {
    icon: Clock,
    title: "Horas perdidas",
    body: "Atualizar planilha, copiar dado, procurar histórico. Tempo que deveria ser de venda.",
  },
];

export function LandingProblem() {
  return (
    <Section id="problema">
      <SectionHeader
        eyebrow="O problema"
        title={<>Vender no escuro custa caro.</>}
        subtitle="Planilha aqui, anotação ali, conversa em outro lugar. Quando a informação está espalhada, oportunidade vira esquecimento — e receita vira estimativa."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PAINS.map((p, i) => {
          const Icon = p.icon;
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
