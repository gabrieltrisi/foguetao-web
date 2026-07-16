"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type { ApiAuditList, ApiAuditLog, AuditFilters } from "@/types/api/audit";

const A = "/api/admin/audit";

/** Auditoria (browser → BFF). Somente leitura. */
export const auditApi = {
  list: (filters?: AuditFilters) =>
    clientFetch<ApiAuditList>(`${A}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiAuditLog>(`${A}/${id}`),
};
