import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  audiencePreviewSchema,
  campaignListSchema,
  campaignMetricsSchema,
  campaignRecipientListSchema,
  campaignSchema,
  campaignTimelineSchema,
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

  /* ---------- Execução (Sprint C2B) ---------- */
  sendNow: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/send-now`, { method: "POST", token, companyId, schema: campaignSchema }),
  pause: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/pause`, { method: "POST", token, companyId, schema: campaignSchema }),
  resume: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/resume`, { method: "POST", token, companyId, schema: campaignSchema }),
  cancel: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/cancel`, { method: "POST", token, companyId, schema: campaignSchema }),
  metrics: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/metrics`, { token, companyId, schema: campaignMetricsSchema }),
  timeline: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}/timeline`, { token, companyId, schema: campaignTimelineSchema }),
  recipients: ({ token, companyId }: Ctx, id: string, params?: QueryParams) =>
    backendFetch(`${BASE}/${id}/recipients${buildQuery(params)}`, {
      token,
      companyId,
      schema: campaignRecipientListSchema,
    }),
};
