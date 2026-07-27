import { defineSegment } from "./define";

export const ACADEMIA = defineSegment(
  { id: "academia", label: "Academia", emoji: "🏋" },
  {
    hero: {
      eyebrow: "CRM para academias e estúdios",
      titleLead: "Mais alunos.",
      titleHighlight: "Menos oportunidades perdidas.",
      subtitle:
        "Organize leads, aulas experimentais e matrículas em um único CRM — e acompanhe cada interessado até virar aluno.",
      primaryCta: "Quero aumentar minhas matrículas",
    },
    benefits: [
      { icon: "trendingUp", title: "Preveja suas matrículas", body: "Veja quantas matrículas estão perto de fechar antes do fim do mês — o funil mostra cada aluno em potencial." },
      { icon: "bell", title: "Nenhuma aula experimental esquecida", body: "Tarefas e lembretes no lugar certo: confirme presenças e faça o follow-up na hora certa." },
      { icon: "users", title: "Consultores na mesma página", body: "Cada consultor com seu acesso; você acompanha quem cuida de cada lead e as matrículas do time." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de experimental em matrícula ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Tudo da recepção num lugar", body: "Leads, visitas, aulas e matrículas num painel só — sem cinco abas abertas." },
      { icon: "zap", title: "Menos papelada, mais alunos", body: "Menos tempo organizando cadastros, mais tempo convertendo interessados." },
    ],
    pipeline: {
      stages: ["Novo lead", "Contato", "Aula experimental", "Visitou", "Proposta", "Matrícula"],
    },
    faqExtra: [
      {
        q: "Posso acompanhar meus consultores?",
        a: "Sim. Cada consultor entra com o próprio acesso e você acompanha quem está cuidando de cada lead e como andam as matrículas do time.",
      },
      {
        q: "Posso organizar aulas experimentais?",
        a: "Sim. A aula experimental é uma etapa do seu funil: você agenda, acompanha quem compareceu e transforma a experiência em matrícula.",
      },
      {
        q: "Posso acompanhar matrículas?",
        a: "Sim. A matrícula é a etapa final do pipeline — você vê quantas fecharam no mês e o que ainda está em negociação.",
      },
    ],
    crm: {
      badge: "Exemplo para Academias",
      dashboard: {
        funnel: [
          { label: "Novos leads", count: "148", pct: 100 },
          { label: "Aula experimental", count: "63", pct: 52 },
          { label: "Visitou", count: "41", pct: 34 },
          { label: "Matrícula", count: "22", pct: 18 },
        ],
        tasks: ["Confirmar aula experimental — Lucas", "Follow-up matrícula — turma manhã", "Ligar para lead — turma noite"],
      },
      board: [
        { stage: "Novo lead", deals: [{ name: "Lucas Ferreira", value: "R$ 1.788" }, { name: "Bruna Costa", value: "R$ 149" }] },
        { stage: "Aula experimental", deals: [{ name: "Rafael Dias", value: "R$ 1.020" }] },
        { stage: "Proposta", deals: [{ name: "Camila Rocha", value: "R$ 894" }] },
        { stage: "Matrícula", deals: [{ name: "Diego Martins", value: "R$ 1.788" }] },
      ],
      contact: {
        name: "Lucas Ferreira",
        role: "Interessado · Plano anual",
        tags: [
          { label: "Lead", tone: "brand" },
          { label: "Aula agendada", tone: "success" },
          { label: "Turma manhã", tone: "neutral" },
        ],
        phone: "(11) 98888-1234",
        email: "lucas.ferreira@email.com",
        activities: [
          { t: "Aula experimental agendada", d: "há 1 h" },
          { t: "Primeiro contato · WhatsApp", d: "ontem" },
          { t: "Movido para “Aula experimental”", d: "há 2 dias" },
        ],
      },
      deal: {
        title: "Lucas Ferreira — Plano anual",
        person: "Aula experimental · fecha em 5 dias",
        value: "R$ 1.788",
        probability: "70%",
        stages: ["Lead", "Experimental", "Proposta", "Matrícula"],
        progressPct: 65,
        status: { label: "Aula agendada", tone: "warning" },
      },
      tasks: [
        { t: "Confirmar aula experimental — Lucas", tag: "Hoje", tone: "brand", done: false },
        { t: "Follow-up matrícula — Bruna", tag: "Hoje", tone: "brand", done: false },
        { t: "Ligar para lead — turma noite", tag: "Amanhã", tone: "neutral", done: false },
        { t: "Atualizar cadastro — Rafael", tag: "Concluída", tone: "success", done: true },
      ],
    },
    proof: {
      demo: true,
      stats: [
        { value: "Aula → matrícula", label: "cada experimental vira etapa do funil" },
        { value: "Tempo real", label: "conversão em matrícula ao vivo" },
        { value: "0 aluno", label: "perdido sem follow-up" },
      ],
      testimonial: {
        quote:
          "Cada aula experimental virou uma etapa que a gente acompanha. Nenhum interessado some mais entre a visita e a matrícula.",
        author: "Rodrigo Sanches",
        role: "Gerente comercial",
        company: "Rede de academias (exemplo)",
      },
    },

    finalCta: {
      titleLead: "Pronto para",
      titleHighlight: "lotar suas turmas",
      titleTail: "?",
      subtitle:
        "Crie sua conta e organize leads, aulas experimentais e matrículas em um só painel — sem perder nenhum aluno pelo caminho.",
      primaryCta: "Quero aumentar minhas matrículas",
    },
  },
);
