import type { ExportFormat, ExportJob, ExportStatus } from "@/types/analytics";

const FORMATS: ExportFormat[] = ["csv", "xlsx", "pdf"];
const STATUSES: ExportStatus[] = ["ready", "processing", "ready", "failed", "expired", "ready"];
const OWNERS = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];

const NAMES = [
  "Desempenho de vendas", "Funil comercial", "ROI por campanha", "Leads por origem",
  "Cohort de retenção", "Previsão de fechamento", "SLA de atendimento", "Fluxo de caixa",
];

export const exportJobs: ExportJob[] = NAMES.map((name, i) => ({
  id: `exp-${i + 1}`,
  report: name,
  format: FORMATS[i % FORMATS.length],
  status: STATUSES[i % STATUSES.length],
  requestedBy: OWNERS[i % OWNERS.length],
  date: `13 jul 2026 · 1${i % 6}:0${i % 6}`,
  expiresAt: `${20 + (i % 8)} jul 2026`,
  size: `${(0.4 + (i % 5) * 0.7).toFixed(1)} MB`,
}));

export const exportStatusLabel: Record<ExportStatus, string> = {
  ready: "Pronto",
  processing: "Processando",
  failed: "Falhou",
  expired: "Expirado",
};

export const exportStatusTone: Record<ExportStatus, "success" | "info" | "danger" | "neutral"> = {
  ready: "success",
  processing: "info",
  failed: "danger",
  expired: "neutral",
};

export const formatLabel: Record<ExportFormat, string> = { csv: "CSV", xlsx: "XLSX", pdf: "PDF" };
