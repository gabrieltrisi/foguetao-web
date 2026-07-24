import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  audiencePreviewSchema,
  campaignListSchema,
  campaignSchema,
} from "@/types/api/campaigns";

interface Ctx {
  token: string;
  companyId: string;
}

const BASE = "/messaging/campaigns";

/** Campanhas de WhatsApp (Sprint C1). Fala com o backend `messaging/campaigns`. */
export const campaignsService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`${BASE}${buildQuery(params)}`, { token, companyId, schema: campaignListSchema }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}`, { token, companyId, schema: campaignSchema }),
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(BASE, { method: "POST", token, companyId, body, schema: campaignSchema }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`${BASE}/${id}`, { method: "PATCH", token, companyId, body, schema: campaignSchema }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}`, { method: "DELETE", token, companyId }),
  duplicate: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/duplicate`, { method: "POST", token, companyId, schema: campaignSchema }),
  previewAudience: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`${BASE}/${id}/audience/preview`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: audiencePreviewSchema,
    }),
  schedule: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`${BASE}/${id}/schedule`, { method: "POST", token, companyId, body, schema: campaignSchema }),
};
