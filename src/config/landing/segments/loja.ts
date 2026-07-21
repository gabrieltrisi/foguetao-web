import { defineSegment } from "./define";

export const LOJA = defineSegment(
  { id: "loja", label: "Loja", emoji: "🛒" },
  {
    hero: {
      eyebrow: "CRM para lojas e comércio",
      titleLead: "Venda mais",
      titleHighlight: "acompanhando cada oportunidade.",
      subtitle:
        "Organize interessados, orçamentos e pedidos num funil só — e transforme curiosos em clientes que voltam.",
      primaryCta: "Quero vender mais",
    },
    pipeline: {
      stages: ["Novo contato", "Orçamento", "Negociação", "Venda", "Pós-venda"],
    },
    faqExtra: [
      {
        q: "Consigo acompanhar orçamentos e pedidos?",
        a: "Sim. Orçamento e venda são etapas do funil: você vê o que foi enviado, o que está em negociação e o que já fechou.",
      },
    ],
    crm: {
      badge: "Exemplo para Lojas",
      dashboard: {
        funnel: [
          { label: "Novos contatos", count: "176", pct: 100 },
          { label: "Orçamento", count: "92", pct: 52 },
          { label: "Negociação", count: "48", pct: 27 },
          { label: "Venda", count: "27", pct: 15 },
        ],
        tasks: ["Enviar orçamento — João", "Follow-up pedido — Marta", "Pós-venda — cliente recorrente"],
      },
      board: [
        { stage: "Novo contato", deals: [{ name: "João Batista", value: "R$ 1.240" }, { name: "Marta Ribeiro", value: "R$ 680" }] },
        { stage: "Orçamento", deals: [{ name: "Eduardo Pinto", value: "R$ 2.150" }] },
        { stage: "Negociação", deals: [{ name: "Renata Cardoso", value: "R$ 3.480" }] },
        { stage: "Venda", deals: [{ name: "Sérgio Almeida", value: "R$ 1.890" }] },
      ],
      contact: {
        name: "João Batista",
        role: "Interessado · Orçamento enviado",
        tags: [
          { label: "Contato", tone: "brand" },
          { label: "Orçamento enviado", tone: "success" },
          { label: "WhatsApp", tone: "neutral" },
        ],
        phone: "(51) 98333-1100",
        email: "joao.batista@email.com",
        activities: [
          { t: "Orçamento enviado — R$ 1.240", d: "há 2 h" },
          { t: "Contato inicial · WhatsApp", d: "ontem" },
          { t: "Movido para “Orçamento”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "João Batista — Pedido",
        person: "Orçamento enviado · decide em 4 dias",
        value: "R$ 1.240",
        probability: "65%",
        stages: ["Contato", "Orçamento", "Negociação", "Venda"],
        progressPct: 60,
        status: { label: "Orçamento enviado", tone: "warning" },
      },
      tasks: [
        { t: "Enviar orçamento — João", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up pedido — Marta", tag: "Hoje", tone: "brand", done: false },
        { t: "Pós-venda — Sérgio", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar cadastro — Eduardo", tag: "Concluída", tone: "success", done: true },
      ],
    },
    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "vender mais",
      titleTail: "?",
      subtitle:
        "Crie sua conta e acompanhe cada interessado, orçamento e pedido num só painel — sem perder venda por falta de retorno.",
      primaryCta: "Quero vender mais",
    },
  },
);
