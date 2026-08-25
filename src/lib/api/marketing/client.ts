"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiAttribution,
  ApiCampaign,
  ApiCampaignAttributions,
  ApiCampaignList,
  ApiContactAttributions,
  ApiLeadSource,
  ApiLeadSourceList,
  AttributionInput,
  AttributionPatch,
  CampaignAction,
  CampaignFilters,
  CampaignInput,
  LeadSourceFilters,
  LeadSourceInput,
} from "@/types/api/marketing";

const B = "/api/marketing/campaigns";

/** Campanhas (browser → BFF). */
export const campaignsApi = {
  list: (filters?: CampaignFilters) =>
    clientFetch<ApiCampaignList>(`${B}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiCampaign>(`${B}/${id}`),
  create: (body: CampaignInput) => clientFetch<ApiCampaign>(B, { method: "POST", body }),
  update: (id: string, body: CampaignInput) =>
    clientFetch<ApiCampaign>(`${B}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch(`${B}/${id}`, { method: "DELETE" }),
  action: (id: string, action: CampaignAction) =>
    clientFetch<ApiCampaign>(`${B}/${id}/${action}`, { method: "POST" }),
};

const LS = "/api/marketing/lead-sources";
const AT = "/api/marketing/attributions";

/** Origens de lead — catálogo da empresa (browser → BFF). */
export const leadSourcesApi = {
  list: (filters?: LeadSourceFilters) =>
    clientFetch<ApiLeadSourceList>(`${LS}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiLeadSource>(`${LS}/${id}`),
  /** Cria as 15 origens padrão (idempotente no backend). */
  setup: () => clientFetch<ApiLeadSourceList>(`${LS}/setup`, { method: "POST" }),
  create: (body: LeadSourceInput) => clientFetch<ApiLeadSource>(LS, { method: "POST", body }),
  update: (id: string, body: LeadSourceInput) =>
    clientFetch<ApiLeadSource>(`${LS}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch(`${LS}/${id}`, { method: "DELETE" }),
};

/** Atribuição — histórico de touchpoints (browser → BFF). */
export const attributionApi = {
  listByContact: (contactId: string) =>
    clientFetch<ApiContactAttributions>(`/api/crm/contacts/${contactId}/attributions`),
  create: (contactId: string, body: AttributionInput) =>
    clientFetch<ApiAttribution>(`/api/crm/contacts/${contactId}/attributions`, {
      method: "POST",
      body,
    }),
  get: (id: string) => clientFetch<ApiAttribution>(`${AT}/${id}`),
  /** Só o vínculo: UTMs e capturedAt são imutáveis. */
  update: (id: string, body: AttributionPatch) =>
    clientFetch<ApiAttribution>(`${AT}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch(`${AT}/${id}`, { method: "DELETE" }),
  listByCampaign: (campaignId: string, params?: { page?: number; limit?: number }) =>
    clientFetch<ApiCampaignAttributions>(
      `/api/marketing/campaigns/${campaignId}/attributions${buildQuery(params as QueryParams)}`,
    ),
};
