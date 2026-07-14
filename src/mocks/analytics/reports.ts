import type { Report, ReportCategory, ReportStatus } from "@/types/analytics";

const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const CATEGORIES: ReportCategory[] = ["Vendas", "Marketing", "Financeiro", "Atendimento", "Operações"];
const STATUSES: ReportStatus[] = ["ready", "ready", "processing", "ready", "error"];

const RAW = [
  { name: "Desempenho de vendas", desc: "Receita, ticket e conversão por período.", fav: true, shared: true, sched: true },
  { name: "Funil comercial", desc: "Volume e taxa de conversão por etapa.", fav: true, shared: false, sched: false },
  { name: "ROI por campanha", desc: "Investimento x receita por campanha.", fav: false, shared: true, sched: true },
  { name: "Leads por origem", desc: "Distribuição e qualidade dos leads.", fav: true, shared: false, sched: false },
  { name: "Produtividade do time", desc: "Atividades e resultados por responsável.", fav: false, shared: true, sched: false },
  { name: "Receita recorrente (MRR)", desc: "MRR, churn e expansão.", fav: false, shared: false, sched: true },
  { name: "SLA de atendimento", desc: "Tempo de resposta e resolução.", fav: false, shared: true, sched: false },
  { name: "Conversão por canal", desc: "Comparativo de canais de aquisição.", fav: true, shared: false, sched: false },
  { name: "Cohort de retenção", desc: "Retenção e recompra por safra.", fav: false, shared: false, sched: false },
  { name: "Previsão de fechamento", desc: "Forecast do trimestre.", fav: false, shared: true, sched: true },
  { name: "Motivos de perda", desc: "Análise de oportunidades perdidas.", fav: false, shared: false, sched: false },
  { name: "Fluxo de caixa", desc: "Entradas e saídas projetadas.", fav: false, shared: false, sched: true },
];

export const reports: Report[] = RAW.map((r, i) => ({
  id: `report-${i + 1}`,
  name: r.name,
  category: CATEGORIES[i % CATEGORIES.length],
  description: r.desc,
  favorite: r.fav,
  shared: r.shared,
  scheduled: r.sched,
  status: STATUSES[i % STATUSES.length],
  owner: OWNERS[i % OWNERS.length],
  updatedAt: ["há 2 h", "ontem", "há 3 dias", "há 1 semana", "hoje"][i % 5],
  views: 4200 - i * 260,
}));

export const reportStatusLabel: Record<ReportStatus, string> = {
  ready: "Pronto",
  processing: "Processando",
  error: "Erro",
};

export const reportStatusTone: Record<ReportStatus, "success" | "info" | "danger"> = {
  ready: "success",
  processing: "info",
  error: "danger",
};

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}
