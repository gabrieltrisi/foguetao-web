import type { Cohort } from "@/types/analytics";

/** Safras de aquisição com retenção % por mês subsequente. */
export const cohorts: Cohort[] = [
  { id: "c-jan", period: "Jan/26", size: 420, retention: [100, 78, 64, 58, 52, 48] },
  { id: "c-fev", period: "Fev/26", size: 486, retention: [100, 82, 68, 61, 55] },
  { id: "c-mar", period: "Mar/26", size: 512, retention: [100, 80, 66, 59] },
  { id: "c-abr", period: "Abr/26", size: 548, retention: [100, 84, 71] },
  { id: "c-mai", period: "Mai/26", size: 602, retention: [100, 86] },
  { id: "c-jun", period: "Jun/26", size: 664, retention: [100] },
];

export const cohortMonthLabels = ["M0", "M1", "M2", "M3", "M4", "M5"];

/** Cor de célula por faixa de retenção (para o heatmap). */
export function retentionColor(value: number): string {
  if (value >= 85) return "bg-brand text-white";
  if (value >= 70) return "bg-brand/70 text-white";
  if (value >= 55) return "bg-brand/45 text-ink";
  if (value >= 40) return "bg-brand-soft text-brand-dark";
  return "bg-surface text-ink-2";
}
