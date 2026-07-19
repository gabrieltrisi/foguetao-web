import { Reveal, PhaseHeading } from "./mission";

/**
 * FAQ — perguntas reais, respostas honestas. Usa <details>/<summary> nativo:
 * acessível, funciona sem JS e sem estado (nada de lint do React Compiler).
 * Nada de promessa que o produto não entrega nem certificação inventada.
 */
export function Faq() {
  return (
    <section id="faq" className="relative mx-auto max-w-[1400px] px-6 py-32 sm:px-10 sm:py-44">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <PhaseHeading phase="?" label="Briefing — Perguntas" title={<>Antes do lançamento.</>}>
          O que costuma passar pela cabeça de quem vai assumir o comando. Se ficou
          alguma dúvida, é só entrar e testar por 14 dias.
        </PhaseHeading>

        <Reveal delay={0.1}>
          <div className="divide-y divide-white/8 border-y border-white/8">
            {ITEMS.map((item, i) => (
              <details key={item.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-brand font-mono text-[11px] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-white/90">{item.q}</span>
                  <span
                    aria-hidden
                    className="relative size-4 shrink-0 text-white/40 transition-colors group-open:text-brand"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-current" />
                    <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 rotate-90 bg-current transition-transform duration-300 group-open:rotate-0" />
                  </span>
                </summary>
                <p className="max-w-2xl pr-8 pb-5 pl-9 text-[14px] leading-relaxed text-white/60">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const ITEMS = [
  {
    q: "O que é o Foguetão?",
    a: "Um centro de comando comercial: CRM, caixa de WhatsApp, pipeline e campanhas em um só painel, com as métricas atualizando enquanto você opera. A ideia é parar de pular entre planilha, abas e e-mail.",
  },
  {
    q: "Preciso de cartão de crédito para testar?",
    a: "Não. O teste é de 14 dias, sem cartão. Você cria o acesso e já entra direto no painel.",
  },
  {
    q: "Consigo trazer meus contatos e histórico?",
    a: "Sim — a importação de contatos faz parte da preparação de lançamento, para você começar com a base que já tem em vez de do zero.",
  },
  {
    q: "Como funciona o WhatsApp dentro do CRM?",
    a: "As conversas de WhatsApp ficam ao lado do contato e do negócio, no mesmo painel — sem trocar de aba para responder e registrar o que foi combinado.",
  },
  {
    q: "Quantas pessoas do time podem usar?",
    a: "A operação é feita para vários usuários, com permissões por papel para definir quem vê e faz o quê. Os limites por plano ainda estão sendo fechados.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "A sessão usa cookies httpOnly (o token nunca fica exposto ao JavaScript do navegador) e trafega sob TLS. Cada acesso é uma sessão isolada, que você pode revogar.",
  },
  {
    q: "E os preços?",
    a: "Os valores e limites de cada plano ainda estão em definição — por isso aparecem como “sob consulta”. Você já pode usar tudo no teste de 14 dias enquanto isso.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. O teste não gera cobrança automática, e não prendemos ninguém por contrato — se não fizer sentido, é só sair.",
  },
] as const;
