"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type { ApiMetricsSummary, MetricsFilters } from "@/types/api/crm-metrics";

/** Métricas comerciais (browser → BFF). Somente leitura. */
export const metricsApi = {
  summary: (filters?: MetricsFilters) =>
    clientFetch<ApiMetricsSummary>(`/api/crm/metrics/summary${buildQuery(filters as QueryParams)}`),
};
