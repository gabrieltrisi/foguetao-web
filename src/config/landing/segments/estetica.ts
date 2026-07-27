import { defineSegment } from "./define";

export const ESTETICA = defineSegment(
  { id: "estetica", label: "Estética", emoji: "💄" },
  {
    hero: {
      eyebrow: "CRM para estúdios de estética",
      titleLead: "Transforme mais contatos",
      titleHighlight: "em agendamentos.",
      subtitle:
        "Acompanhe interessados, avaliações e pacotes num funil só — e nunca deixe um agendamento esfriar.",
      primaryCta: "Quero mais agendamentos",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja seus agendamentos", body: "Veja quantos contatos estão perto de agendar — o funil mostra cada oportunidade." },
      { icon: "bell", title: "Nenhum agendamento esfriando", body: "Tarefas e lembretes no lugar certo: confirme avaliações e faça o follow-up." },
      { icon: "users", title: "Equipe na mesma página", body: "Cada pessoa com seu acesso; todos veem os mesmos contatos e pacotes." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de contato em agendamento ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Contatos num lugar só", body: "Interessados, avaliações e pacotes num painel só — sem abas espalhadas." },
      { icon: "zap", title: "Menos organização, mais agenda cheia", body: "Menos tempo com cadastro, mais tempo transformando contato em cliente." },
    ],
    problems: [
      { icon: "bell", title: "Agendamento que esfria", body: "Quem pediu preço e não marcou fica sem follow-up." },
      { icon: "trendingUp", title: "Agenda com furos", body: "Sem funil, sobra horário e falta previsão." },
      { icon: "users", title: "Equipe sem base única", body: "Contatos e pacotes espalhados entre as pessoas." },
      { icon: "zap", title: "Cadastro roubando tempo", body: "Tempo organizando é tempo longe do atendimento." },
    ],

    highlightFeatures: ["Tarefas", "Pipeline", "Contatos"],

    pipeline: {
      stages: ["Novo contato", "Avaliação", "Agendamento", "Procedimento", "Retorno"],
    },
    faqExtra: [
      {
        q: "Consigo organizar avaliações e retornos?",
        a: "Sim. Avaliação e retorno são etapas do funil: você acompanha quem agendou, quem compareceu e quem precisa de um novo contato.",
      },
    ],
    crm: {
      badge: "Exemplo para Estética",
      dashboard: {
        funnel: [
          { label: "Novos contatos", count: "118", pct: 100 },
          { label: "Avaliação", count: "64", pct: 54 },
          { label: "Agendamento", count: "38", pct: 32 },
          { label: "Retorno", count: "20", pct: 17 },
        ],
        tasks: ["Confirmar avaliação — Larissa", "Follow-up pacote — Camila", "Lembrar retorno — Amanda"],
      },
      board: [
        { stage: "Novo contato", deals: [{ name: "Larissa Melo", value: "R$ 480" }, { name: "Camila Duarte", value: "R$ 260" }] },
        { stage: "Avaliação", deals: [{ name: "Amanda Freitas", value: "R$ 720" }] },
        { stage: "Agendamento", deals: [{ name: "Vanessa Lopes", value: "R$ 1.100" }] },
        { stage: "Retorno", deals: [{ name: "Patrícia Gomes", value: "R$ 480" }] },
      ],
      contact: {
        name: "Larissa Melo",
        role: "Interessada · Pacote de procedimentos",
        tags: [
          { label: "Contato", tone: "brand" },
          { label: "Avaliação agendada", tone: "success" },
          { label: "Instagram", tone: "neutral" },
        ],
        phone: "(41) 98444-7788",
        email: "larissa.melo@email.com",
        activities: [
          { t: "Avaliação agendada", d: "há 2 h" },
          { t: "Contato inicial · Instagram", d: "ontem" },
          { t: "Movido para “Avaliação”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Larissa Melo — Pacote de procedimentos",
        person: "Avaliação agendada · fecha em 6 dias",
        value: "R$ 1.100",
        probability: "60%",
        stages: ["Contato", "Avaliação", "Agendamento", "Retorno"],
        progressPct: 55,
        status: { label: "Avaliação agendada", tone: "warning" },
      },
      tasks: [
        { t: "Confirmar avaliação — Larissa", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up pacote — Camila", tag: "Hoje", tone: "brand", done: false },
        { t: "Lembrar retorno — Amanda", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar contato — Vanessa", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Contato → agenda", label: "cada avaliação acompanhada" },
        { value: "Tempo real", label: "conversão em agendamento ao vivo" },
        { value: "0 agendamento", label: "esfriando" },
      ],
      case: {
        label: "Como costuma mudar",
        before: "Contatos espalhados, agendamento de memória, agenda com furos.",
        after: "Cada avaliação vira etapa do funil com próximo passo — a agenda enche com o mesmo movimento.",
      },
      testimonial: {
        quote:
          "A agenda ficou mais cheia porque nenhum contato fica sem retorno. Cada avaliação vira um próximo passo claro.",
        author: "Bruna Camargo",
        role: "Proprietária",
        company: "Estúdio de estética (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "lotar sua agenda",
      titleTail: "?",
      subtitle:
        "Crie sua conta e organize contatos, avaliações e agendamentos num só painel — sem deixar nenhum interessado sem resposta.",
      primaryCta: "Quero mais agendamentos",
    },
  },
);
