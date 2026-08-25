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
    benefits: [
      { icon: "trendingUp", title: "Preveja suas vendas", body: "Veja quais orçamentos estão perto de fechar — o funil mostra cada venda em potencial." },
      { icon: "bell", title: "Nenhum orçamento sem retorno", body: "Tarefas e lembretes no lugar certo: faça o follow-up de cada pedido na hora certa." },
      { icon: "users", title: "Balcão e vendas alinhados", body: "Cada vendedor com seu acesso; todos veem os mesmos contatos e pedidos." },
      { icon: "chart", title: "Decida com o número do dia", body: "A conversão de orçamento em venda ao vivo, não na planilha de ontem." },
      { icon: "layers", title: "Vendas num lugar só", body: "Contatos, orçamentos e pedidos num painel só — sem cinco abas abertas." },
      { icon: "zap", title: "Menos planilha, mais venda", body: "Menos tempo organizando, mais tempo transformando curioso em cliente." },
    ],
    problems: [
      { icon: "bell", title: "Orçamento sem retorno", body: "Quem pediu preço e não voltou fica sem follow-up." },
      { icon: "trendingUp", title: "Vendas imprevisíveis", body: "Sem funil, o mês depende da sorte do balcão." },
      { icon: "users", title: "Vendedores sem base única", body: "Contatos e pedidos espalhados entre as pessoas." },
      { icon: "zap", title: "Cadastro tomando o tempo da venda", body: "Organizar planilha é tempo longe do cliente." },
    ],

    highlightFeatures: ["Pipeline", "Contatos", "Tarefas"],

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
    proof: {
      demo: true,
      stats: [
        { value: "Contato → recompra", label: "histórico do cliente sempre à mão" },
        { value: "Tempo real", label: "orçamentos e pedidos ao vivo" },
        { value: "0 orçamento", label: "sem follow-up" },
      ],
      case: {
        label: "Como costuma mudar",
        before: "Orçamentos no papel, cliente que sumiu esquecido, mês incerto.",
        after: "Cada contato no funil com follow-up — recompra e histórico num lugar só.",
      },
      testimonial: {
        quote:
          "Passamos a vender mais pra quem já comprou. O histórico do cliente fica num lugar só e o follow-up não escapa.",
        author: "Sérgio Antunes",
        role: "Dono",
        company: "Loja (exemplo)",
      },
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
