import { defineSegment } from "./define";

export const AGENCIA = defineSegment(
  { id: "agencia", label: "Agência", emoji: "📈" },
  {
    hero: {
      eyebrow: "CRM para agências",
      titleLead: "Controle seus leads antes que",
      titleHighlight: "virem clientes da concorrência.",
      subtitle:
        "Do primeiro briefing ao contrato assinado — acompanhe cada oportunidade num funil só, sem deixar nada esfriar.",
      primaryCta: "Quero fechar mais contratos",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja seus contratos", body: "Veja quais propostas estão perto de fechar — o funil mostra cada cliente em potencial." },
      { icon: "bell", title: "Nenhum lead esfriando", body: "Tarefas e lembretes no lugar certo: faça o follow-up antes da concorrência." },
      { icon: "users", title: "Time comercial na mesma página", body: "Cada pessoa com seu acesso; você acompanha quem cuida de cada lead." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de diagnóstico em contrato ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Cada oportunidade num lugar só", body: "Leads, diagnósticos e propostas num painel só — sem abas espalhadas." },
      { icon: "zap", title: "Menos organização, mais fechamento", body: "Menos tempo com cadastro, mais tempo fechando contratos." },
    ],
    pipeline: {
      stages: ["Novo lead", "Diagnóstico", "Proposta", "Negociação", "Contrato"],
    },
    faqExtra: [
      {
        q: "Consigo acompanhar minha equipe comercial?",
        a: "Sim. Cada pessoa entra com o próprio acesso e você acompanha quem está cuidando de cada lead e em que etapa está cada proposta.",
      },
    ],
    crm: {
      badge: "Exemplo para Agências",
      dashboard: {
        funnel: [
          { label: "Novos leads", count: "86", pct: 100 },
          { label: "Diagnóstico", count: "44", pct: 51 },
          { label: "Proposta enviada", count: "27", pct: 31 },
          { label: "Contrato", count: "11", pct: 13 },
        ],
        tasks: ["Enviar proposta — Loja Norte", "Follow-up diagnóstico — Studio X", "Reunião de fechamento — Marca Y"],
      },
      board: [
        { stage: "Novo lead", deals: [{ name: "Loja Norte", value: "R$ 4.500/mês" }, { name: "Studio X", value: "R$ 2.800/mês" }] },
        { stage: "Diagnóstico", deals: [{ name: "Marca Y", value: "R$ 6.200/mês" }] },
        { stage: "Proposta", deals: [{ name: "Grupo Vega", value: "R$ 9.000/mês" }] },
        { stage: "Contrato", deals: [{ name: "Rede Sul", value: "R$ 7.400/mês" }] },
      ],
      contact: {
        name: "Camila Nogueira",
        role: "Marketing · Loja Norte",
        tags: [
          { label: "Lead", tone: "brand" },
          { label: "Diagnóstico feito", tone: "success" },
          { label: "Indicação", tone: "neutral" },
        ],
        phone: "(11) 98222-6655",
        email: "camila@lojanorte.com",
        activities: [
          { t: "Proposta enviada — R$ 4.500/mês", d: "há 1 h" },
          { t: "Diagnóstico apresentado", d: "ontem" },
          { t: "Movido para “Proposta”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Loja Norte — Gestão mensal",
        person: "Camila Nogueira · fecha em 10 dias",
        value: "R$ 4.500/mês",
        probability: "70%",
        stages: ["Lead", "Diagnóstico", "Proposta", "Contrato"],
        progressPct: 70,
        status: { label: "Em negociação", tone: "warning" },
      },
      tasks: [
        { t: "Enviar proposta — Loja Norte", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up diagnóstico — Studio X", tag: "Hoje", tone: "brand", done: false },
        { t: "Reunião de fechamento — Marca Y", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar cadastro — Grupo Vega", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Lead → contrato", label: "pipeline inteiro num lugar" },
        { value: "Tempo real", label: "propostas e follow-up ao vivo" },
        { value: "0 proposta", label: "esfriando sem retorno" },
      ],
      testimonial: {
        quote:
          "Centralizamos proposta e follow-up. Paramos de perder contrato por falta de um retorno na hora certa.",
        author: "Diego Prado",
        role: "Head comercial",
        company: "Agência (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "fechar mais contratos",
      titleTail: "?",
      subtitle:
        "Crie sua conta e acompanhe cada lead, proposta e negociação num só painel — sem deixar oportunidade escapar para a concorrência.",
      primaryCta: "Quero fechar mais contratos",
    },
  },
);
