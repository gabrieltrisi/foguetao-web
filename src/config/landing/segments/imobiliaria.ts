import { defineSegment } from "./define";

export const IMOBILIARIA = defineSegment(
  { id: "imobiliaria", label: "Imobiliária", emoji: "🏠" },
  {
    hero: {
      eyebrow: "CRM para imobiliárias e corretores",
      titleLead: "Nunca mais perca um comprador",
      titleHighlight: "por falta de acompanhamento.",
      subtitle:
        "Cada lead, visita e proposta no lugar certo — do primeiro contato à chave na mão, sem deixar oportunidade esfriar.",
      primaryCta: "Quero vender mais imóveis",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja seus fechamentos", body: "Veja quais propostas estão perto de fechar — o funil mostra cada comprador em potencial." },
      { icon: "bell", title: "Nenhum comprador sem follow-up", body: "Tarefas e lembretes no lugar certo: acompanhe visitas e propostas na hora certa." },
      { icon: "users", title: "Corretores na mesma página", body: "Cada corretor com seu acesso; você acompanha quem cuida de cada negociação." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de visita em proposta ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Cada imóvel num lugar só", body: "Leads, visitas e propostas num painel só — sem cinco abas abertas." },
      { icon: "zap", title: "Menos planilha, mais vendas", body: "Menos tempo organizando, mais tempo fechando negócios." },
    ],
    problems: [
      { icon: "bell", title: "Comprador sem follow-up", body: "Quem visitou e não recebeu retorno fecha com outro corretor." },
      { icon: "trendingUp", title: "Vendas imprevisíveis", body: "Sem funil, não dá para prever quantas fecham no mês." },
      { icon: "users", title: "Corretores desalinhados", body: "Cada corretor com sua lista de compradores." },
      { icon: "zap", title: "Planilha que não acompanha visita", body: "Tempo com cadastro é tempo sem vender imóvel." },
    ],

    highlightFeatures: ["Pipeline", "Negócios", "Tarefas"],

    pipeline: {
      stages: ["Lead", "Visita", "Proposta", "Fechamento"],
    },
    faqExtra: [
      {
        q: "Consigo acompanhar meus corretores?",
        a: "Sim. Cada corretor tem o próprio acesso e você acompanha quem está cuidando de cada comprador e em que etapa está cada negociação.",
      },
      {
        q: "Dá para organizar visitas e propostas?",
        a: "Sim. Visita e proposta são etapas do funil — você vê o que foi agendado, o que foi enviado e o que está perto de fechar.",
      },
    ],
    crm: {
      badge: "Exemplo para Imobiliárias",
      dashboard: {
        funnel: [
          { label: "Novos leads", count: "204", pct: 100 },
          { label: "Visita agendada", count: "88", pct: 44 },
          { label: "Proposta enviada", count: "39", pct: 20 },
          { label: "Fechamento", count: "12", pct: 8 },
        ],
        tasks: ["Confirmar visita — Ap. 302 Ed. Aurora", "Enviar proposta — Casa Jardim Sul", "Follow-up comprador — Cobertura"],
      },
      board: [
        { stage: "Lead", deals: [{ name: "Ap. 302 · Ed. Aurora", value: "R$ 620.000" }, { name: "Sala comercial · Centro", value: "R$ 410.000" }] },
        { stage: "Visita", deals: [{ name: "Casa · Jardim Sul", value: "R$ 890.000" }] },
        { stage: "Proposta", deals: [{ name: "Cobertura · Vista Mar", value: "R$ 1.250.000" }] },
        { stage: "Fechamento", deals: [{ name: "Ap. 71 · Parque Verde", value: "R$ 540.000" }] },
      ],
      contact: {
        name: "Ricardo Mendes",
        role: "Comprador · Ap. 302 Ed. Aurora",
        tags: [
          { label: "Comprador", tone: "brand" },
          { label: "Visita feita", tone: "success" },
          { label: "Financiamento", tone: "neutral" },
        ],
        phone: "(11) 97666-8899",
        email: "ricardo.mendes@email.com",
        activities: [
          { t: "Proposta enviada — R$ 600.000", d: "há 2 h" },
          { t: "Visita realizada · Ap. 302", d: "ontem" },
          { t: "Movido para “Proposta”", d: "há 3 dias" },
        ],
      },
      deal: {
        title: "Ap. 302 · Ed. Aurora",
        person: "Ricardo Mendes · fecha em 15 dias",
        value: "R$ 620.000",
        probability: "80%",
        stages: ["Lead", "Visita", "Proposta", "Fechamento"],
        progressPct: 75,
        status: { label: "Em proposta", tone: "warning" },
      },
      tasks: [
        { t: "Confirmar visita — Casa Jardim Sul", tag: "Hoje", tone: "brand", done: false },
        { t: "Enviar proposta — Ricardo", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up financiamento — Cobertura", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar cadastro — Sala Centro", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Visita → proposta", label: "cada etapa acompanhada" },
        { value: "Tempo real", label: "funil do mês ao vivo" },
        { value: "0 comprador", label: "sem follow-up" },
      ],
      case: {
        label: "Como costuma mudar",
        before: "Compradores em planilha, visita sem retorno, venda imprevisível.",
        after: "Cada visita e proposta no funil — nenhum comprador sem acompanhamento.",
      },
      testimonial: {
        quote:
          "Antes a gente perdia comprador entre a visita e a proposta. Agora cada corretor sabe exatamente qual é o próximo passo.",
        author: "Paula Aragão",
        role: "Gestora de vendas",
        company: "Imobiliária (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "fechar mais vendas",
      titleTail: "?",
      subtitle:
        "Crie sua conta e acompanhe cada lead, visita e proposta num só painel — do primeiro contato à assinatura do contrato.",
      primaryCta: "Quero vender mais imóveis",
    },
  },
);
