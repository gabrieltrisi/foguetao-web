import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { auditListSchema, auditLogSchema } from "@/types/api/audit";

interface Ctx {
  token: string;
  companyId: string;
}

/** Auditoria (Sprint 1.0D-6) — somente leitura contra GET /audit e /audit/:id. */
export const auditService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/audit${buildQuery(params)}`, { token, companyId, schema: auditListSchema }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/audit/${id}`, { token, companyId, schema: auditLogSchema }),
};
