import { formatCurrency } from "@/lib/format";
import type { ForecastRep, ForecastScenario } from "@/types/analytics";

export const forecastTarget = 1500000;
export const forecastExpected = 1284900;

export const forecastScenarios: ForecastScenario[] = [
  { label: "Melhor cenário", value: 1620000, tone: "success" },
  { label: "Cenário esperado", value: 1284900, tone: "info" },
  { label: "Pior cenário", value: 940000, tone: "danger" },
];

export const forecastReps: ForecastRep[] = [
  { id: "r1", owner: "Camila Ribeiro", open: 42, weighted: 386000, target: 400000 },
  { id: "r2", owner: "Rafael Monteiro", open: 38, weighted: 342000, target: 380000 },
  { id: "r3", owner: "Bruno Alcântara", open: 31, weighted: 298000, target: 320000 },
  { id: "r4", owner: "Larissa Prado", open: 27, weighted: 258000, target: 400000 },
];

export const forecastSummary = {
  openDeals: 138,
  openValue: 1840000,
  weightedValue: forecastExpected,
  gap: forecastTarget - forecastExpected,
  gapLabel: formatCurrency(forecastTarget - forecastExpected),
  attainment: Math.round((forecastExpected / forecastTarget) * 100),
};
