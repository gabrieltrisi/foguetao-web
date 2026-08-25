import { defineSegment } from "./define";

export const CLINICA = defineSegment(
  { id: "clinica", label: "Clínica", emoji: "🏥" },
  {
    hero: {
      eyebrow: "CRM comercial para clínicas",
      titleLead: "Organize seu comercial e",
      titleHighlight: "aumente novos atendimentos.",
      subtitle:
        "Centralize contatos, orçamentos e retornos do seu time comercial num funil só — sem depender de planilhas.",
      primaryCta: "Quero mais atendimentos",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja novos atendimentos", body: "Veja quais orçamentos estão perto de fechar — o funil mostra cada oportunidade comercial." },
      { icon: "bell", title: "Nenhum orçamento sem retorno", body: "Tarefas e lembretes no lugar certo: faça o follow-up de cada avaliação e orçamento." },
      { icon: "users", title: "Time comercial alinhado", body: "Cada pessoa com seu acesso; você acompanha quem cuida de cada contato." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de avaliação em fechamento ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Comercial num lugar só", body: "Contatos, avaliações e orçamentos num painel só — sem depender de planilhas." },
      { icon: "zap", title: "Menos planilha, mais atendimento", body: "Menos tempo organizando, mais tempo trazendo novos pacientes." },
    ],
    problems: [
      { icon: "bell", title: "Orçamento sem retorno", body: "Quem fez avaliação e recebeu orçamento fica sem follow-up." },
      { icon: "trendingUp", title: "Novos atendimentos imprevisíveis", body: "Sem funil comercial, não dá para prever o mês." },
      { icon: "users", title: "Time comercial desalinhado", body: "Cada pessoa com sua lista de contatos e orçamentos." },
      { icon: "zap", title: "Planilha travando a recepção", body: "Tempo com cadastro é tempo longe do paciente." },
    ],

    highlightFeatures: ["Pipeline", "Contatos", "Tarefas"],

    pipeline: {
      stages: ["Novo contato", "Avaliação", "Orçamento", "Retorno", "Fechado"],
    },
    faqExtra: [
      {
        q: "O Foguetão tem agenda médica ou prontuário?",
        a: "Não. O Foguetão cuida do lado comercial — contatos, orçamentos e follow-up. Ele não substitui sistemas de agenda médica nem de prontuário.",
      },
      {
        q: "Consigo acompanhar orçamentos e retornos?",
        a: "Sim. Orçamento e retorno são etapas do funil: você vê o que foi enviado, o que está em decisão e quem precisa de um novo contato.",
      },
    ],
    crm: {
      badge: "Exemplo para Clínicas",
      dashboard: {
        funnel: [
          { label: "Novos contatos", count: "132", pct: 100 },
          { label: "Avaliação", count: "71", pct: 54 },
          { label: "Orçamento", count: "40", pct: 30 },
          { label: "Fechado", count: "21", pct: 16 },
        ],
        tasks: ["Enviar orçamento — Fernanda", "Follow-up avaliação — Paulo", "Retorno — pacote trimestral"],
      },
      board: [
        { stage: "Novo contato", deals: [{ name: "Fernanda Souza", value: "R$ 1.200" }, { name: "Paulo Vieira", value: "R$ 640" }] },
        { stage: "Avaliação", deals: [{ name: "Helena Castro", value: "R$ 2.400" }] },
        { stage: "Orçamento", deals: [{ name: "Tiago Barros", value: "R$ 3.100" }] },
        { stage: "Fechado", deals: [{ name: "Sofia Ramos", value: "R$ 1.800" }] },
      ],
      contact: {
        name: "Fernanda Souza",
        role: "Interessada · Orçamento em análise",
        tags: [
          { label: "Contato", tone: "brand" },
          { label: "Avaliação feita", tone: "success" },
          { label: "Indicação", tone: "neutral" },
        ],
        phone: "(31) 98555-2211",
        email: "fernanda.souza@email.com",
        activities: [
          { t: "Orçamento enviado — R$ 1.200", d: "há 4 h" },
          { t: "Avaliação realizada", d: "ontem" },
          { t: "Movido para “Orçamento”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Fernanda Souza — Pacote de atendimentos",
        person: "Orçamento enviado · decide em 8 dias",
        value: "R$ 1.200",
        probability: "65%",
        stages: ["Contato", "Avaliação", "Orçamento", "Fechado"],
        progressPct: 70,
        status: { label: "Orçamento enviado", tone: "warning" },
      },
      tasks: [
        { t: "Enviar orçamento — Fernanda", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up avaliação — Paulo", tag: "Hoje", tone: "brand", done: false },
        { t: "Retorno — Helena", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar contato — Tiago", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "1 funil", label: "contatos, orçamentos e retornos juntos" },
        { value: "Tempo real", label: "conversão de avaliação em fechamento" },
        { value: "0 orçamento", label: "sem retorno" },
      ],
      case: {
        label: "Como costuma mudar",
        before: "Orçamentos soltos, avaliação sem follow-up, mês na surpresa.",
        after: "Contatos, orçamentos e retornos num funil — cada avaliação acompanhada até o fechamento.",
      },
      testimonial: {
        quote:
          "Os retornos deixaram de depender de memória. O time vê quem avaliou, quem tem orçamento aberto e quem precisa de um novo contato.",
        author: "Dra. Helena Vasconcelos",
        role: "Sócia",
        company: "Clínica (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "encher sua agenda comercial",
      titleTail: "?",
      subtitle:
        "Crie sua conta e organize contatos, orçamentos e retornos num só painel — sem deixar nenhum interessado sem resposta.",
      primaryCta: "Quero mais atendimentos",
    },
  },
);
