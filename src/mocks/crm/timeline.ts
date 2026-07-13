import type { TimelineEvent } from "@/types/crm";

/** Histórico genérico reutilizado em detalhes de contato/deal. */
export const contactTimeline: TimelineEvent[] = [
  { id: "t1", type: "created", title: "Contato criado", description: "Origem: Formulário do site", time: "12 jul 2026 · 09:12" },
  { id: "t2", type: "email", title: "E-mail enviado", description: "Apresentação da plataforma", time: "12 jul 2026 · 10:40" },
  { id: "t3", type: "call", title: "Ligação realizada", description: "Duração 8 min · interessado", time: "13 jul 2026 · 14:05" },
  { id: "t4", type: "deal", title: "Oportunidade criada", description: "Plano Performance anual", time: "13 jul 2026 · 14:20" },
  { id: "t5", type: "whatsapp", title: "Mensagem no WhatsApp", description: "“Podemos fechar essa semana?”", time: "hoje · 10:42" },
];

export const dealTimeline: TimelineEvent[] = [
  { id: "d1", type: "created", title: "Oportunidade criada", time: "10 jul 2026 · 11:00" },
  { id: "d2", type: "stage", title: "Movida para Qualificado", description: "por Camila Ribeiro", time: "11 jul 2026 · 16:30" },
  { id: "d3", type: "note", title: "Nota adicionada", description: "Decisor confirmado, orçamento aprovado", time: "12 jul 2026 · 09:15" },
  { id: "d4", type: "stage", title: "Movida para Proposta", description: "por Rafael Monteiro", time: "hoje · 08:40" },
];

export const contactActivities = [
  { id: "a1", actor: "Camila Ribeiro", text: "**Camila** registrou uma ligação de 8 min", time: "há 4 h" },
  { id: "a2", actor: "Rafael Monteiro", text: "**Rafael** moveu a oportunidade para **Proposta**", time: "ontem" },
  { id: "a3", actor: "Você", text: "**Você** adicionou a tag **VIP**", time: "há 2 dias" },
];

export const contactNotes = [
  { id: "n1", author: "Camila Ribeiro", time: "há 3 h", body: "Cliente pediu para revisar a proposta com desconto por volume." },
  { id: "n2", author: "Rafael Monteiro", time: "ontem", body: "Decisor é o diretor comercial; retorno confirmado para sexta." },
];

export const dealComments = [
  { id: "c1", author: "Camila Ribeiro", time: "há 1 h", body: "Enviei a proposta revisada, aguardando retorno." },
  { id: "c2", author: "Bruno Alcântara", time: "há 3 h", body: "Podemos oferecer 2 meses de bônus no plano anual." },
];

export const dealChecklist = [
  { id: "ck1", label: "Reunião de descoberta", done: true },
  { id: "ck2", label: "Proposta enviada", done: true },
  { id: "ck3", label: "Aprovação do decisor", done: false },
  { id: "ck4", label: "Assinatura do contrato", done: false },
];

export const dealProducts = [
  { id: "p1", name: "Plano Performance (anual)", qty: 1, price: 28800 },
  { id: "p2", name: "Usuários adicionais", qty: 5, price: 4500 },
  { id: "p3", name: "Onboarding premium", qty: 1, price: 3200 },
];

export const detailFiles = [
  { id: "f1", name: "proposta-comercial.pdf", size: "248 KB" },
  { id: "f2", name: "contrato-minuta.docx", size: "86 KB" },
  { id: "f3", name: "apresentacao.pdf", size: "1,2 MB" },
];

export const customFields = [
  { label: "CNPJ", value: "12.345.678/0001-90" },
  { label: "Origem", value: "Inbound · Site" },
  { label: "Segmento", value: "Tecnologia" },
  { label: "LTV estimado", value: "R$ 84.000" },
];
