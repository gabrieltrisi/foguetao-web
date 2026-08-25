import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { metricsSummarySchema } from "@/types/api/crm-metrics";

interface Ctx {
  token: string;
  companyId: string;
}

/** Resumo comercial (Sprint 1.2) — somente leitura de GET /metrics/summary. */
export const metricsService = {
  summary: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/metrics/summary${buildQuery(params)}`, {
      token,
      companyId,
      schema: metricsSummarySchema,
    }),
};
