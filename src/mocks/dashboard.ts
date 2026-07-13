import { formatCurrency, formatNumber } from "@/lib/format";
import type {
  ActivityItem,
  ConversationItem,
  FunnelStage,
  Metric,
  PerformanceKpi,
  PeriodOption,
  TaskItem,
} from "@/types";

/**
 * Dados mockados do dashboard — fonte única (não espalhar valores em componentes).
 * Valores fiéis às páginas 8–10 do design reference.
 */

export const periodOptions: PeriodOption[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
];

export const dashboardMetrics: Metric[] = [
  {
    id: "contatos",
    label: "Contatos",
    value: formatNumber(12482),
    deltaPercent: 8.2,
    trend: "up",
    hint: "Total de contatos na base.",
  },
  {
    id: "oportunidades",
    label: "Oportunidades abertas",
    value: formatNumber(384),
    deltaPercent: 3.1,
    trend: "up",
    hint: "Oportunidades ativas no pipeline.",
  },
  {
    id: "receita-aberto",
    label: "Receita em aberto",
    value: formatCurrency(1284900),
    deltaPercent: 12.4,
    trend: "up",
    hint: "Soma das oportunidades em aberto.",
  },
  {
    id: "vendas",
    label: "Vendas realizadas",
    value: formatCurrency(428760),
    deltaPercent: -2.1,
    trend: "down",
    hint: "Receita ganha no período.",
  },
];

export const funnelStages: FunnelStage[] = [
  { id: "novo-lead", label: "Novo lead", count: 428, amount: 620000 },
  { id: "contato", label: "Contato realizado", count: 256, amount: 512000 },
  { id: "qualificado", label: "Qualificado", count: 188, amount: 384000 },
  { id: "proposta", label: "Proposta", count: 92, amount: 268400 },
  { id: "negociacao", label: "Negociação", count: 46, amount: 184900 },
  { id: "ganho", label: "Ganho", count: 28, amount: 128760 },
];

export const performanceKpis: PerformanceKpi[] = [
  { id: "receita", label: "Receita", value: formatCurrency(428760), delta: "+12,4%", trend: "up" },
  { id: "conversao", label: "Conversão", value: "6,8%", delta: "+0,9 pp", trend: "up" },
  { id: "ticket", label: "Ticket médio", value: formatCurrency(4280), delta: "+3,2%", trend: "up" },
  { id: "ciclo", label: "Ciclo médio", value: "18 dias", delta: "-2 dias", trend: "up" },
];

export const recentActivities: ActivityItem[] = [
  {
    id: "a1",
    actorInitials: "CR",
    text: "**Camila Ribeiro** criou o contato **Núcleo Digital Ltda.**",
    time: "há 4 min",
  },
  {
    id: "a2",
    actorInitials: "RM",
    text: "**Rafael Monteiro** moveu a oportunidade **Zenit Corp** · Proposta → Negociação",
    time: "há 22 min",
  },
  {
    id: "a3",
    actorInitials: "V",
    text: "**Você** adicionou nota em **Studio Ampère**",
    time: "há 1 h",
  },
  {
    id: "a4",
    actorInitials: "BA",
    text: "**Bruno Alcântara** concluiu a tarefa **Ligar para Vertex Farma**",
    time: "há 2 h",
  },
  {
    id: "a5",
    actorInitials: "W",
    text: "**WhatsApp** recebeu mensagem de **Larissa · Grão Café**",
    time: "há 3 h",
  },
];

export const pendingTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Enviar proposta para Vertex Farma",
    owner: "Camila R.",
    due: "Hoje, 17:00",
    priority: "alta",
    done: false,
  },
  {
    id: "t2",
    title: "Follow-up com Zenit Corp",
    owner: "Rafael M.",
    due: "Amanhã, 09:30",
    priority: "media",
    done: false,
  },
  {
    id: "t3",
    title: "Revisar campanha Meta — Black Week",
    owner: "Você",
    due: "Sex, 14:00",
    priority: "alta",
    done: false,
  },
  {
    id: "t4",
    title: "Ligar para Studio Ampère",
    owner: "Bruno A.",
    due: "Seg, 10:00",
    priority: "baixa",
    done: false,
  },
];

export const recentConversations: ConversationItem[] = [
  {
    id: "c1",
    name: "Larissa · Grão Café",
    initials: "L",
    preview: "Perfeito, podemos fechar hoje ainda?",
    channel: "WhatsApp · Camila R.",
    time: "10:42",
    unread: 2,
  },
  {
    id: "c2",
    name: "Vertex Farma",
    initials: "V",
    preview: "Recebemos a proposta, obrigado!",
    channel: "WhatsApp · Rafael M.",
    time: "09:15",
    unread: 0,
  },
  {
    id: "c3",
    name: "Núcleo Digital",
    initials: "N",
    preview: "Qual o próximo passo?",
    channel: "WhatsApp · Você",
    time: "Ontem",
    unread: 1,
  },
  {
    id: "c4",
    name: "Studio Ampère",
    initials: "S",
    preview: "Podemos marcar para quinta.",
    channel: "WhatsApp · Bruno A.",
    time: "Ontem",
    unread: 0,
  },
];
