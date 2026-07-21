import { Plus } from "lucide-react";
import { Section, SectionHeader } from "./section";
import { Reveal } from "./reveal";

const FAQ = [
  {
    q: "O que é o Foguetão?",
    a: "Um CRM brasileiro que reúne contatos, pipeline, negócios, tarefas e campanhas em um só painel — feito para times comerciais venderem com organização e clareza.",
  },
  {
    q: "Preciso de cartão de crédito para testar?",
    a: "Não. O teste é de 14 dias, sem cartão. Você cria a conta e começa a usar na hora.",
  },
  {
    q: "Consigo importar meus contatos?",
    a: "Sim. Você traz sua base atual e trabalha com o histórico organizado desde o primeiro dia.",
  },
  {
    q: "Quantas pessoas do meu time podem usar?",
    a: "Quantas você precisar. Cada pessoa entra com o próprio acesso e permissões definidas por função.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Sessões revogáveis, cookies httpOnly, conexão TLS e isolamento por empresa. Segurança é a base da plataforma.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. Sem fidelidade e sem cobrança automática surpresa. Você continua porque o produto entrega.",
  },
];

export function LandingFaq() {
  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeader eyebrow="Perguntas" title={<>Ainda com dúvidas?</>} subtitle="O essencial antes de criar sua conta. Se ficou algo, é só entrar e testar por 14 dias." />

        <div className="flex flex-col divide-y divide-white/[0.07] border-t border-white/[0.07]">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.04}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium text-white/90 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus className="size-4 shrink-0 text-white/40 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                </summary>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/55">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
