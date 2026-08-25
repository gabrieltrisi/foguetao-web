"use client";

import { useQuery } from "@tanstack/react-query";
import { metricsApi } from "@/lib/api/crm-metrics/client";
import { queryKeys } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { MetricsFilters } from "@/types/api/crm-metrics";

/**
 * Resumo comercial. Exige `crm.metrics.read` — VIEWER e SUPPORT não têm, então
 * a query nem sai (a tela mostra o estado de permissão negada).
 */
export function useMetricsSummary(filters?: MetricsFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.metricsSummary(filters), activeCompanyId],
    queryFn: () => metricsApi.summary(filters),
    enabled: Boolean(activeCompanyId) && can("crm.metrics.read"),
    // mantém os números anteriores enquanto troca o filtro (evita piscar)
    placeholderData: (prev) => prev,
  });
}
