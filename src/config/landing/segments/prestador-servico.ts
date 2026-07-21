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
