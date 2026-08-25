import type { UsageLimit } from "@/types/admin";

export const usageLimits: UsageLimit[] = [
  { key: "users", label: "Usuários", used: 24, total: 25 },
  { key: "contacts", label: "Contatos", used: 12482, total: 50000 },
  { key: "campaigns", label: "Campanhas", used: 86, total: 500 },
  { key: "messages", label: "Mensagens", used: 148902, total: 200000 },
  { key: "executions", label: "Execuções", used: 34210, total: 100000 },
  { key: "automations", label: "Automações", used: 37, total: 100 },
  { key: "storage", label: "Armazenamento", used: 68, total: 100, unit: "GB" },
  { key: "api", label: "API Requests", used: 412000, total: 1000000 },
];

/** Percentual de uso (0–100), limitado a 100. */
export function usagePercent(limit: UsageLimit): number {
  return Math.min(100, Math.round((limit.used / limit.total) * 100));
}

/** Tom por faixa de uso: normal < 75, atenção < 90, crítico >= 90. */
export function usageTone(percent: number): "brand" | "warning" | "danger" {
  if (percent >= 90) return "danger";
  if (percent >= 75) return "warning";
  return "brand";
}
