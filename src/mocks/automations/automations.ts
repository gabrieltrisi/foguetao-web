import type { Automation, AutomationCategory, AutomationStatus, FlowNode } from "@/types/automations";

let nodeCounter = 0;
function n(typeId: string, label: string, subtitle?: string, config?: FlowNode["config"]): FlowNode {
  nodeCounter += 1;
  return { id: `node-${nodeCounter}`, typeId, label, subtitle, config };
}

const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const STATUSES: AutomationStatus[] = ["active", "active", "paused", "draft"];
const CATEGORIES: AutomationCategory[] = ["Marketing", "Vendas", "Suporte", "Financeiro", "Operações"];

const RAW: { name: string; trigger: string; triggerType: string; nodes: FlowNode[] }[] = [
  {
    name: "Boas-vindas — novo lead",
    trigger: "Lead criado",
    triggerType: "trg-lead",
    nodes: [
      n("trg-lead", "Lead criado", "Origem: Instagram"),
      n("lgc-wait", "Esperar", "15 minutos", [{ label: "Duração", value: "15 min" }]),
      n("act-whatsapp", "Enviar WhatsApp", "Template: Boas-vindas", [{ label: "Template", value: "Boas-vindas" }]),
      n("act-task", "Criar tarefa", "Para o responsável"),
      n("act-notify", "Notificar equipe", "Canal: #comercial"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Follow-up de proposta",
    trigger: "Mudança de etapa",
    triggerType: "trg-stage",
    nodes: [
      n("trg-stage", "Mudança de etapa", "Proposta enviada"),
      n("lgc-wait", "Esperar", "2 dias"),
      n("lgc-condition", "Condição", "Respondeu?"),
      n("act-whatsapp", "Enviar WhatsApp", "Follow-up"),
      n("act-notify", "Notificar equipe"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Carrinho abandonado",
    trigger: "Webhook",
    triggerType: "trg-webhook",
    nodes: [
      n("trg-webhook", "Webhook", "checkout.abandoned"),
      n("lgc-wait", "Esperar", "1 hora"),
      n("act-email", "Enviar e-mail", "Recuperação"),
      n("lgc-wait", "Esperar", "1 dia"),
      n("act-whatsapp", "Enviar WhatsApp", "Cupom 10%"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Reativação de lead frio",
    trigger: "Agendamento",
    triggerType: "trg-schedule",
    nodes: [
      n("trg-schedule", "Agendamento", "Toda segunda 09:00"),
      n("act-update-lead", "Atualizar lead", "Status: reengajamento"),
      n("act-email", "Enviar e-mail", "Novidades"),
      n("act-add-tag", "Adicionar tag", "Reativação"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Pós-venda + NPS",
    trigger: "Pagamento aprovado",
    triggerType: "trg-payment",
    nodes: [
      n("trg-payment", "Pagamento aprovado"),
      n("act-whatsapp", "Enviar WhatsApp", "Obrigado!"),
      n("lgc-wait", "Esperar", "7 dias"),
      n("act-email", "Enviar e-mail", "Pesquisa NPS"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Roteamento de suporte",
    trigger: "Mensagem recebida",
    triggerType: "trg-message",
    nodes: [
      n("trg-message", "Mensagem recebida", "Canal: WhatsApp"),
      n("lgc-condition", "Condição", "Contém 'fatura'?"),
      n("act-notify", "Notificar equipe", "#financeiro"),
      n("act-task", "Criar tarefa"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
  {
    name: "Cobrança automática",
    trigger: "Data específica",
    triggerType: "trg-date",
    nodes: [
      n("trg-date", "Data específica", "Dia do vencimento"),
      n("act-email", "Enviar e-mail", "Lembrete de fatura"),
      n("lgc-wait", "Esperar", "3 dias"),
      n("act-http", "HTTP", "POST gateway"),
      n("exit-end", "Encerrar fluxo"),
    ],
  },
];

export const automations: Automation[] = RAW.map((r, i) => ({
  id: `auto-${i + 1}`,
  name: r.name,
  status: STATUSES[i % STATUSES.length],
  triggerLabel: r.trigger,
  triggerTypeId: r.triggerType,
  lastRun: ["há 4 min", "há 1 h", "ontem", "há 2 dias", "há 20 min"][i % 5],
  successRate: [98.2, 95.4, 99.1, 87.6, 100, 92.3, 96.8][i % 7],
  executions: 1284 - i * 148,
  owner: OWNERS[i % OWNERS.length],
  category: CATEGORIES[i % CATEGORIES.length],
  nodes: r.nodes,
}));

export const automationStatusLabel: Record<AutomationStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  draft: "Rascunho",
};

export const automationStatusTone: Record<AutomationStatus, "success" | "warning" | "info"> = {
  active: "success",
  paused: "warning",
  draft: "info",
};

export function getAutomationById(id: string): Automation | undefined {
  return automations.find((a) => a.id === id);
}

/** Rascunho em branco para a criação de uma nova automação. */
export const blankAutomation: Automation = {
  id: "new",
  name: "Nova automação",
  status: "draft",
  triggerLabel: "Manual",
  triggerTypeId: "trg-manual",
  lastRun: "—",
  successRate: 0,
  executions: 0,
  owner: "Camila Ribeiro",
  category: "Operações",
  nodes: [
    n("trg-manual", "Disparo manual", "Escolha um gatilho"),
    n("act-whatsapp", "Enviar WhatsApp", "Configure a mensagem"),
    n("exit-end", "Encerrar fluxo"),
  ],
};
