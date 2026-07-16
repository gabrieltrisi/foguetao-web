import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { campaignListSchema, campaignSchema, type CampaignAction } from "@/types/api/marketing";

interface Ctx {
  token: string;
  companyId: string;
}

/** Campanhas (Sprint 1.5A-1) — server → backend, validado por Zod. */
export const marketingService = {
  listCampaigns: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/campaigns${buildQuery(params)}`, {
      token,
      companyId,
      schema: campaignListSchema,
    }),
  getCampaign: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/campaigns/${id}`, { token, companyId, schema: campaignSchema }),
  createCampaign: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/campaigns`, { method: "POST", token, companyId, body, schema: campaignSchema }),
  updateCampaign: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/campaigns/${id}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: campaignSchema,
    }),
  /** DELETE devolve `{ message }` — repassado sem reescrita. */
  deleteCampaign: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/campaigns/${id}`, { method: "DELETE", token, companyId }),
  /** Ação de status: o backend valida a transição (409 se inválida). */
  campaignAction: ({ token, companyId }: Ctx, id: string, action: CampaignAction) =>
    backendFetch(`/campaigns/${id}/${action}`, {
      method: "POST",
      token,
      companyId,
      schema: campaignSchema,
    }),
};
