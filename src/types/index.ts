/** Tipos de domínio usados pela UI (dados mockados nesta etapa). */

export type Trend = "up" | "down" | "flat";
export type Priority = "alta" | "media" | "baixa";

export type Metric = {
  id: string;
  label: string;
  /** Valor já formatado para exibição. */
  value: string;
  /** Variação percentual vs. período anterior. */
  deltaPercent: number;
  trend: Trend;
  hint?: string;
};

export type FunnelStage = {
  id: string;
  label: string;
  count: number;
  amount: number;
};

export type PerformanceKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
};

export type ActivityItem = {
  id: string;
  actorInitials: string;
  /** Texto rico já resolvido; partes em negrito marcadas por **. */
  text: string;
  time: string;
};

export type TaskItem = {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: Priority;
  done: boolean;
};

export type ConversationItem = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  channel: string;
  time: string;
  unread: number;
};

export type Company = {
  id: string;
  name: string;
  plan: string;
};

export type CurrentUser = {
  name: string;
  email: string;
  initials: string;
};

export type PeriodValue = "hoje" | "7d" | "30d" | "mes" | "custom";

export type PeriodOption = {
  value: PeriodValue;
  label: string;
};
