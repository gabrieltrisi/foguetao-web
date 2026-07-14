/** Tipos do módulo de Analytics, Relatórios e Auditoria (mockado). */
import type { Trend } from "@/types";

export type ReportStatus = "ready" | "processing" | "error";
export type ReportCategory = "Vendas" | "Marketing" | "Financeiro" | "Atendimento" | "Operações";

export type Report = {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  favorite: boolean;
  shared: boolean;
  scheduled: boolean;
  status: ReportStatus;
  owner: string;
  updatedAt: string;
  views: number;
};

export type AnalyticsKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
};

export type ComparisonRow = {
  id: string;
  label: string;
  current: number;
  previous: number;
  valueLabel: string;
};

export type FunnelType = "marketing" | "vendas" | "atendimento";

export type FunnelStage = {
  label: string;
  count: number;
};

export type Funnel = {
  id: string;
  name: string;
  type: FunnelType;
  avgTime: string;
  conversion: number;
  stages: FunnelStage[];
};

export type AttributionModel = "first" | "last" | "linear" | "position";

export type AttributionRow = {
  id: string;
  label: string;
  conversions: number;
  revenue: number;
};

export type Cohort = {
  id: string;
  /** Rótulo do período de aquisição (ex.: "Jan/26"). */
  period: string;
  size: number;
  /** Retenção % por período subsequente (índice 0 = período de aquisição). */
  retention: number[];
};

export type ForecastScenario = { label: string; value: number; tone: "success" | "info" | "danger" };

export type ForecastRep = {
  id: string;
  owner: string;
  open: number;
  weighted: number;
  target: number;
};

export type AuditStatus = "success" | "failure";

export type AuditEvent = {
  id: string;
  user: string;
  action: string;
  entity: string;
  module: string;
  date: string;
  ip: string;
  requestId: string;
  status: AuditStatus;
  metadata: { label: string; value: string }[];
};

export type ActivityModule = "crm" | "mensagens" | "campanhas" | "automacoes" | "integracoes" | "equipe";

export type ActivityEntry = {
  id: string;
  module: ActivityModule;
  actor: string;
  text: string;
  time: string;
};

export type ExportFormat = "csv" | "xlsx" | "pdf";
export type ExportStatus = "ready" | "processing" | "failed" | "expired";

export type ExportJob = {
  id: string;
  report: string;
  format: ExportFormat;
  status: ExportStatus;
  requestedBy: string;
  date: string;
  expiresAt: string;
  size: string;
};
