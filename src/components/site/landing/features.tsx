import {
  LayoutGrid,
  SquareKanban,
  Users,
  Building2,
  Target,
  ListTodo,
  Megaphone,
  Boxes,
} from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const FEATURES = [
  { icon: LayoutGrid, name: "Visão geral", desc: "Receita, conversão e atividades do time ao vivo." },
  { icon: SquareKanban, name: "Pipeline", desc: "Funil visual com etapas e arrastar e soltar." },
  { icon: Users, name: "Contatos", desc: "Base completa com histórico e atividades." },
  { icon: Building2, name: "Organizações", desc: "Empresas e contas ligadas aos seus contatos." },
  { icon: Target, name: "Negócios", desc: "Oportunidades com valor, etapa e probabilidade." },
  { icon: ListTodo, name: "Tarefas", desc: "Follow-ups e lembretes que mantêm o ritmo." },
  { icon: Megaphone, name: "Campanhas", desc: "Organize e acompanhe suas ações de comunicação." },
  { icon: Boxes, name: "Multiempresa", desc: "Gerencie várias operações em uma única conta." },
];

export function LandingFeatures() {
  return (
    <Section id="recursos">
      <SectionHeader
        eyebrow="Recursos"
        title={<>Tudo o que um time comercial precisa.</>}
        subtitle="Sem excesso, sem firula. Cada recurso existe para mover um negócio adiante."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.name} delay={(i % 4) * 0.05} className="h-full">
              <div className="flex h-full flex-col bg-[#0a0a0c] p-6 transition-colors duration-200 hover:bg-[#101014]">
                <Icon className="size-5 text-brand" aria-hidden />
                <h3 className="mt-4 text-[15px] font-semibold text-white">{f.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{f.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
