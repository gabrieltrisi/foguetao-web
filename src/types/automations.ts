/** Tipos do módulo de Automações & Fluxos (dados mockados). */

export type NodeCategory = "trigger" | "action" | "logic" | "exit";

/** Catálogo de tipos de nó. */
export type NodeType = {
  id: string;
  label: string;
  category: NodeCategory;
  /** Nome do ícone Lucide (resolvido em nodeIcon). */
  icon: string;
  description: string;
};

/** Instância de nó dentro de um fluxo. */
export type FlowNode = {
  id: string;
  typeId: string;
  label: string;
  subtitle?: string;
  config?: { label: string; value: string }[];
};

export type AutomationStatus = "active" | "paused" | "draft";
export type AutomationCategory = "Marketing" | "Vendas" | "Suporte" | "Financeiro" | "Operações";

export type Automation = {
  id: string;
  name: string;
  status: AutomationStatus;
  triggerLabel: string;
  triggerTypeId: string;
  lastRun: string;
  successRate: number;
  executions: number;
  owner: string;
  category: AutomationCategory;
  nodes: FlowNode[];
};

export type AutomationTemplate = {
  id: string;
  name: string;
  category: AutomationCategory;
  description: string;
  nodeCount: number;
  icon: string;
  popular: boolean;
};

export type ExecutionStatus = "success" | "failed" | "running" | "retrying";
export type ExecutionStepStatus = "success" | "failed" | "skipped" | "running";

export type ExecutionStep = {
  id: string;
  nodeLabel: string;
  status: ExecutionStepStatus;
  time: string;
  detail?: string;
};

export type ExecutionLog = {
  time: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
};

export type Execution = {
  id: string;
  automationId: string;
  automationName: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt: string;
  duration: string;
  trigger: string;
  attempt: number;
  steps: ExecutionStep[];
  logs: ExecutionLog[];
};

export type VariableType = "string" | "number" | "secret" | "boolean" | "json";
export type VariableEnv = "prod" | "staging" | "dev";
export type VariableScope = "global" | "workflow";

export type AutomationVariable = {
  id: string;
  key: string;
  type: VariableType;
  value: string;
  environment: VariableEnv;
  scope: VariableScope;
  description: string;
};

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "date" | "interval";

export type ScheduledAutomation = {
  id: string;
  name: string;
  frequency: ScheduleFrequency;
  frequencyLabel: string;
  nextRun: string;
  timezone: string;
  enabled: boolean;
};

export type WebhookCall = { id: string; time: string; status: number; ip: string };

export type Webhook = {
  id: string;
  name: string;
  endpoint: string;
  method: "POST" | "GET" | "PUT";
  status: "active" | "inactive";
  secret: string;
  calls: WebhookCall[];
};
