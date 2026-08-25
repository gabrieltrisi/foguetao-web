import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  campaignAttributionsSchema,
  campaignListSchema,
  campaignSchema,
  contactAttributionsSchema,
  attributionSchema,
  leadSourceListSchema,
  leadSourceSchema,
  type CampaignAction,
} from "@/types/api/marketing";

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

/** Origens de lead e atribuição (Sprint 1.5A-2) — server → backend. */
export const attributionService = {
  listLeadSources: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/lead-sources${buildQuery(params)}`, {
      token,
      companyId,
      schema: leadSourceListSchema,
    }),
  getLeadSource: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/lead-sources/${id}`, { token, companyId, schema: leadSourceSchema }),
  /** Cria as 15 origens padrão. Idempotente no backend. */
  setupLeadSources: ({ token, companyId }: Ctx) =>
    backendFetch(`/lead-sources/setup`, {
      method: "POST",
      token,
      companyId,
      schema: leadSourceListSchema,
    }),
  createLeadSource: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/lead-sources`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: leadSourceSchema,
    }),
  updateLeadSource: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/lead-sources/${id}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: leadSourceSchema,
    }),
  deleteLeadSource: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/lead-sources/${id}`, { method: "DELETE", token, companyId }),

  /** Histórico do contato + primeiro/último toque (derivados pelo backend). */
  listContactAttributions: ({ token, companyId }: Ctx, contactId: string) =>
    backendFetch(`/contacts/${contactId}/attributions`, {
      token,
      companyId,
      schema: contactAttributionsSchema,
    }),
  /** 201 nova captura, 200 se idêntica já existia — o backend deduplica. */
  createAttribution: ({ token, companyId }: Ctx, contactId: string, body: unknown) =>
    backendFetch(`/contacts/${contactId}/attributions`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: attributionSchema,
    }),
  getAttribution: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/attributions/${id}`, { token, companyId, schema: attributionSchema }),
  /** Só corrige o vínculo: UTMs são imutáveis. */
  updateAttribution: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/attributions/${id}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: attributionSchema,
    }),
  deleteAttribution: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/attributions/${id}`, { method: "DELETE", token, companyId }),
  /** Leads da campanha: contagem de contatos, nunca métrica de mídia. */
  listCampaignAttributions: ({ token, companyId }: Ctx, campaignId: string, params?: QueryParams) =>
    backendFetch(`/campaigns/${campaignId}/attributions${buildQuery(params)}`, {
      token,
      companyId,
      schema: campaignAttributionsSchema,
    }),
};
