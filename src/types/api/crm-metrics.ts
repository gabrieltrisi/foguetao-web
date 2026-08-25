import { z } from "zod";

/**
 * Contrato real de `GET /metrics/summary` (MetricsService.summary).
 *
 * Pontos que ditam a UI:
 * - `totalValue` é STRING monetária, somada POR MOEDA (não há um "total geral";
 *   converter moedas seria inventar câmbio).
 * - `winRate` é percentual 0–100 com 2 casas, e vale 0 quando não há fechados.
 * - `byStage` cobre SOMENTE deals OPEN e traz apenas `stageId` — o nome da etapa
 *   vem de `/pipelines/:id/stages`.
 * - Empresa sem dados → buckets com `count: 0`, `byCurrency: []` e `byStage: []`.
 */
export const moneyByCurrencySchema = z.object({
  currency: z.string(),
  count: z.number(),
  totalValue: z.string(),
});
export type ApiMoneyByCurrency = z.infer<typeof moneyByCurrencySchema>;

export const statusBucketSchema = z.object({
  count: z.number(),
  byCurrency: z.array(moneyByCurrencySchema),
});
export type ApiStatusBucket = z.infer<typeof statusBucketSchema>;

export const metricsSummarySchema = z.object({
  scope: z.object({
    pipelineId: z.string().nullable(),
    from: z.string().nullable(),
    to: z.string().nullable(),
  }),
  open: statusBucketSchema,
  won: statusBucketSchema,
  lost: statusBucketSchema,
  winRate: z.number(),
  byStage: z.array(z.object({ stageId: z.string(), count: z.number() })),
});
export type ApiMetricsSummary = z.infer<typeof metricsSummarySchema>;

/** Filtros reais de GET /metrics/summary (aplicados sobre `createdAt`). */
export interface MetricsFilters {
  pipelineId?: string;
  from?: string;
  to?: string;
}
