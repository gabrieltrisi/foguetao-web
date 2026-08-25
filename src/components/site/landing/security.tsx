import { MonitorSmartphone, KeyRound, Boxes, Lock } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const ITEMS = [
  { icon: MonitorSmartphone, title: "Sessões revogáveis", body: "Veja onde sua conta está aberta e encerre qualquer dispositivo em um clique." },
  { icon: KeyRound, title: "Papéis e permissões", body: "Cada pessoa acessa apenas o que precisa. Controle de acesso por função (RBAC)." },
  { icon: Boxes, title: "Multiempresa isolada", body: "Os dados de cada empresa ficam separados e protegidos, sob a mesma conta." },
  { icon: Lock, title: "Autenticação segura", body: "Cookies httpOnly, conexão TLS e bloqueio progressivo contra tentativas indevidas." },
];

export function LandingSecurity() {
  return (
    <Section id="seguranca">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <SectionHeader
          eyebrow="Segurança & controle"
          title={<>Seus dados sob controle.</>}
          subtitle="Segurança não é recurso avançado — é a base. Do login às permissões, cada acesso é pensado para proteger a sua operação."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.title} delay={(i % 2) * 0.06}>
                <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.03]">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-brand">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-white">{it.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{it.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
