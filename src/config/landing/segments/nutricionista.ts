import { defineSegment } from "./define";

export const NUTRICIONISTA = defineSegment(
  { id: "nutricionista", label: "Nutricionista", emoji: "🥗" },
  {
    hero: {
      eyebrow: "CRM para nutricionistas",
      titleLead: "Converta mais interessados",
      titleHighlight: "em consultas.",
      subtitle:
        "Organize contatos, primeiras consultas, planos e retornos num funil só — sem perder quem chegou até você.",
      primaryCta: "Quero aumentar minhas consultas",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja suas consultas", body: "Veja quantos interessados estão perto de agendar — o funil mostra cada consulta em potencial." },
      { icon: "bell", title: "Nenhum retorno esquecido", body: "Tarefas e lembretes no lugar certo: confirme consultas e faça o follow-up dos retornos." },
      { icon: "users", title: "Sua recepção alinhada", body: "Cada pessoa com seu acesso; todos veem os mesmos contatos e agendamentos." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de contato em consulta ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Contatos num lugar só", body: "Interessados, consultas e retornos num painel só — sem planilhas paralelas." },
      { icon: "zap", title: "Menos organização, mais atendimento", body: "Menos tempo com cadastro, mais tempo com quem quer marcar." },
    ],
    pipeline: {
      stages: ["Novo contato", "Consulta", "Plano", "Retorno"],
    },
    faqExtra: [
      {
        q: "Consigo organizar primeiras consultas e retornos?",
        a: "Sim. Consulta e retorno são etapas do funil: você acompanha quem agendou, quem compareceu e quem precisa de um novo contato.",
      },
      {
        q: "O Foguetão substitui um sistema de prontuário?",
        a: "Não. O Foguetão é um CRM comercial — cuida de contatos, agendamentos e follow-up. Ele não guarda prontuário nem dados clínicos.",
      },
    ],
    crm: {
      badge: "Exemplo para Nutricionistas",
      dashboard: {
        funnel: [
          { label: "Novos contatos", count: "96", pct: 100 },
          { label: "Consulta agendada", count: "58", pct: 60 },
          { label: "Plano contratado", count: "34", pct: 35 },
          { label: "Retorno", count: "19", pct: 20 },
        ],
        tasks: ["Confirmar primeira consulta — Ana", "Follow-up plano trimestral — Rafael", "Lembrar retorno — turma manhã"],
      },
      board: [
        { stage: "Novo contato", deals: [{ name: "Ana Prado", value: "R$ 320" }, { name: "Marcos Lima", value: "R$ 180" }] },
        { stage: "Consulta", deals: [{ name: "Juliana Reis", value: "R$ 540" }] },
        { stage: "Plano", deals: [{ name: "Rafael Nunes", value: "R$ 960" }] },
        { stage: "Retorno", deals: [{ name: "Beatriz Alves", value: "R$ 320" }] },
      ],
      contact: {
        name: "Ana Prado",
        role: "Interessada · Acompanhamento trimestral",
        tags: [
          { label: "Contato", tone: "brand" },
          { label: "Consulta agendada", tone: "success" },
          { label: "Online", tone: "neutral" },
        ],
        phone: "(21) 98777-4321",
        email: "ana.prado@email.com",
        activities: [
          { t: "Primeira consulta agendada", d: "há 3 h" },
          { t: "Contato inicial · WhatsApp", d: "ontem" },
          { t: "Movido para “Consulta”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Ana Prado — Acompanhamento trimestral",
        person: "Consulta agendada · fecha em 7 dias",
        value: "R$ 960",
        probability: "60%",
        stages: ["Contato", "Consulta", "Plano", "Retorno"],
        progressPct: 50,
        status: { label: "Consulta agendada", tone: "warning" },
      },
      tasks: [
        { t: "Confirmar primeira consulta — Ana", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up plano — Rafael", tag: "Hoje", tone: "brand", done: false },
        { t: "Lembrar retorno — Juliana", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar contato — Marcos", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Contato → consulta", label: "cada interessado no funil" },
        { value: "Tempo real", label: "agenda de consultas ao vivo" },
        { value: "0 retorno", label: "esquecido" },
      ],
      testimonial: {
        quote:
          "Os interessados pararam de sumir. Vejo quem agendou, quem compareceu e quem precisa de um novo contato.",
        author: "Marina Teixeira",
        role: "Nutricionista",
        company: "Consultório (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para lotar",
      titleHighlight: "sua agenda de consultas",
      titleTail: "?",
      subtitle:
        "Crie sua conta e organize contatos, consultas e retornos num só painel — sem deixar nenhum interessado sem resposta.",
      primaryCta: "Quero aumentar minhas consultas",
    },
  },
);
