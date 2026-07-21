import type { SegmentContent } from "./types";

/**
 * Conteúdo GERAL da Landing — a fonte da verdade. Extraído 1:1 das seções
 * atuais, de modo que a landing sem segmento continue idêntica. Todos os outros
 * segmentos sobrescrevem apenas o necessário por cima deste (deep-merge).
 */
export const DEFAULT_SEGMENT: SegmentContent = {
  id: "default",
  label: "Geral",
  emoji: "🌎",

  hero: {
    eyebrow: "Plataforma comercial para times que crescem",
    titleLead: "Toda a sua operação comercial, em",
    titleHighlight: "trajetória de crescimento.",
    subtitle:
      "Contatos, pipeline, negócios, tarefas e campanhas reunidos em um painel único — com cada número atualizado em tempo real. Menos planilhas, mais decisões.",
    primaryCta: "Começar agora",
    note: "14 dias grátis · sem cartão de crédito · suporte em português",
  },

  benefits: [
    { icon: "trendingUp", title: "Previsibilidade de receita", body: "Saiba o que vai fechar antes do fim do mês — o funil mostra onde está cada real." },
    { icon: "bell", title: "Follow-up que não escapa", body: "Cada tarefa e cada lembrete no lugar certo. Nenhuma oportunidade esquecida." },
    { icon: "users", title: "Time na mesma página", body: "Todos veem o mesmo pipeline e os mesmos números. Fim das versões paralelas." },
    { icon: "chart", title: "Decisão por dado", body: "Métricas ao vivo em vez de planilha de ontem. Ajuste a rota na hora certa." },
    { icon: "layers", title: "Menos ferramentas", body: "Uma plataforma no lugar de cinco abas abertas. Tudo conversa entre si." },
    { icon: "zap", title: "Velocidade no dia a dia", body: "Menos tempo organizando, mais tempo vendendo. A rotina fica leve." },
  ],

  faqExtra: [],

  pipeline: {
    stages: ["Novo lead", "Em contato", "Proposta enviada", "Fechamento"],
  },

  crm: {
    badge: "",
    dashboard: {
      funnel: [
        { label: "Novos leads", count: "312", pct: 100 },
        { label: "Em contato", count: "224", pct: 72 },
        { label: "Proposta enviada", count: "141", pct: 45 },
        { label: "Fechamento", count: "88", pct: 28 },
      ],
      tasks: ["Ligar para Studio Vitta", "Enviar proposta — Alpha", "Follow-up Rede Norte"],
    },
    board: [
      { stage: "Lead", deals: [{ name: "Studio Vitta", value: "R$ 12.400" }, { name: "Café Aurora", value: "R$ 6.900" }] },
      { stage: "Em contato", deals: [{ name: "Rede Norte", value: "R$ 38.000" }, { name: "Alpha Log", value: "R$ 21.500" }] },
      { stage: "Proposta", deals: [{ name: "Grupo Meridian", value: "R$ 74.000" }] },
      { stage: "Fechamento", deals: [{ name: "Oficina Praia", value: "R$ 29.800" }] },
    ],
    contact: {
      name: "Marina Alves",
      role: "Diretora comercial · Studio Vitta",
      tags: [
        { label: "Cliente", tone: "brand" },
        { label: "Ativo", tone: "success" },
        { label: "Sudeste", tone: "neutral" },
      ],
      phone: "(11) 99999-0000",
      email: "marina@studiovitta.com",
      activities: [
        { t: "Proposta enviada — R$ 12.400", d: "há 2 h" },
        { t: "Ligação registrada · 6 min", d: "ontem" },
        { t: "Movido para “Em contato”", d: "há 3 dias" },
      ],
    },
    deal: {
      title: "Studio Vitta — Plano anual",
      person: "Marina Alves · fecha em 12 dias",
      value: "R$ 42.000",
      probability: "85%",
      stages: ["Lead", "Contato", "Proposta", "Fechamento"],
      progressPct: 75,
      status: { label: "Em negociação", tone: "warning" },
    },
    tasks: [
      { t: "Enviar proposta — Studio Vitta", tag: "Hoje", tone: "brand", done: false },
      { t: "Follow-up com Rede Norte", tag: "Hoje", tone: "brand", done: false },
      { t: "Preparar reunião — Grupo Meridian", tag: "Amanhã", tone: "neutral", done: false },
      { t: "Atualizar cadastro Alpha Log", tag: "Concluída", tone: "success", done: true },
    ],
  },

  finalCta: {
    titleLead: "Pronto para",
    titleHighlight: "decolar",
    titleTail: "?",
    subtitle:
      "Crie sua conta em minutos e veja sua operação comercial ganhar altitude — com organização, clareza e controle desde o primeiro dia.",
    primaryCta: "Começar agora",
  },
};
