import { defineSegment } from "./define";

export const PRESTADOR_SERVICO = defineSegment(
  { id: "prestador-servico", label: "Prestador de Serviço", emoji: "🧰" },
  {
    hero: {
      eyebrow: "CRM para prestadores de serviço",
      titleLead: "Transforme pedidos de orçamento",
      titleHighlight: "em contratos.",
      subtitle:
        "Acompanhe cada solicitação, orçamento e follow-up num funil só — sem perder trabalho por falta de retorno.",
      primaryCta: "Quero fechar mais orçamentos",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja seus fechamentos", body: "Veja quais orçamentos estão perto de virar contrato — o funil mostra cada trabalho em potencial." },
      { icon: "bell", title: "Nenhum orçamento sem retorno", body: "Tarefas e lembretes no lugar certo: faça o follow-up de cada solicitação na hora certa." },
      { icon: "users", title: "Equipe na mesma página", body: "Cada pessoa com seu acesso; todos veem as mesmas solicitações e orçamentos." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de orçamento em contrato ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Trabalhos num lugar só", body: "Solicitações, orçamentos e follow-up num painel só — sem abas espalhadas." },
      { icon: "zap", title: "Menos organização, mais serviço fechado", body: "Menos tempo com cadastro, mais tempo executando o trabalho." },
    ],
    pipeline: {
      stages: ["Solicitação", "Orçamento", "Negociação", "Contrato", "Concluído"],
    },
    faqExtra: [
      {
        q: "Consigo acompanhar solicitações e orçamentos?",
        a: "Sim. Solicitação e orçamento são etapas do funil: você vê o que chegou, o que foi enviado e o que está perto de fechar.",
      },
    ],
    crm: {
      badge: "Exemplo para Prestadores de Serviço",
      dashboard: {
        funnel: [
          { label: "Solicitações", count: "112", pct: 100 },
          { label: "Orçamento enviado", count: "68", pct: 61 },
          { label: "Negociação", count: "35", pct: 31 },
          { label: "Contrato", count: "18", pct: 16 },
        ],
        tasks: ["Enviar orçamento — Reforma cozinha", "Follow-up — Instalação elétrica", "Agendar visita técnica — Pintura"],
      },
      board: [
        { stage: "Solicitação", deals: [{ name: "Reforma cozinha", value: "R$ 8.400" }, { name: "Instalação elétrica", value: "R$ 2.900" }] },
        { stage: "Orçamento", deals: [{ name: "Pintura apartamento", value: "R$ 5.200" }] },
        { stage: "Negociação", deals: [{ name: "Marcenaria sob medida", value: "R$ 12.700" }] },
        { stage: "Contrato", deals: [{ name: "Manutenção predial", value: "R$ 6.800" }] },
      ],
      contact: {
        name: "Roberto Antunes",
        role: "Cliente · Reforma de cozinha",
        tags: [
          { label: "Solicitação", tone: "brand" },
          { label: "Orçamento enviado", tone: "success" },
          { label: "Indicação", tone: "neutral" },
        ],
        phone: "(61) 98111-3344",
        email: "roberto.antunes@email.com",
        activities: [
          { t: "Orçamento enviado — R$ 8.400", d: "há 3 h" },
          { t: "Visita técnica realizada", d: "ontem" },
          { t: "Movido para “Orçamento”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Roberto Antunes — Reforma de cozinha",
        person: "Orçamento enviado · decide em 9 dias",
        value: "R$ 8.400",
        probability: "60%",
        stages: ["Solicitação", "Orçamento", "Negociação", "Contrato"],
        progressPct: 55,
        status: { label: "Orçamento enviado", tone: "warning" },
      },
      tasks: [
        { t: "Enviar orçamento — Reforma cozinha", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up — Instalação elétrica", tag: "Hoje", tone: "brand", done: false },
        { t: "Agendar visita — Pintura", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar cadastro — Marcenaria", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Pedido → contrato", label: "cada orçamento no funil" },
        { value: "Tempo real", label: "orçamentos e follow-up ao vivo" },
        { value: "0 pedido", label: "sem retorno" },
      ],
      testimonial: {
        quote:
          "Cada pedido de orçamento vira uma etapa que a gente acompanha. Fechamos mais do mesmo número de solicitações.",
        author: "Carlos Ferreira",
        role: "Proprietário",
        company: "Prestador de serviço (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "fechar mais orçamentos",
      titleTail: "?",
      subtitle:
        "Crie sua conta e acompanhe cada solicitação, orçamento e follow-up num só painel — sem perder trabalho por falta de retorno.",
      primaryCta: "Quero fechar mais orçamentos",
    },
  },
);
