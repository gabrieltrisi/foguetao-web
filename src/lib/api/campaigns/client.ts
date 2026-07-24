"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiAudiencePreview,
  ApiCampaign,
  ApiCampaignList,
  AudienceSpec,
  CampaignFilters,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "@/types/api/campaigns";

const C = "/api/messaging/campaigns";

/** Cliente de Campanhas (browser → BFF). Nunca fala com o backend direto. */
export const campaignsApi = {
  list: (filters?: CampaignFilters) =>
    clientFetch<ApiCampaignList>(`${C}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiCampaign>(`${C}/${id}`),
  create: (body: CreateCampaignInput) =>
    clientFetch<ApiCampaign>(C, { method: "POST", body }),
  update: (id: string, body: UpdateCampaignInput) =>
    clientFetch<ApiCampaign>(`${C}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch<void>(`${C}/${id}`, { method: "DELETE" }),
  duplicate: (id: string) => clientFetch<ApiCampaign>(`${C}/${id}/duplicate`, { method: "POST" }),
  previewAudience: (id: string, audience?: AudienceSpec) =>
    clientFetch<ApiAudiencePreview>(`${C}/${id}/audience/preview`, {
      method: "POST",
      body: audience ? { audience } : {},
    }),
  schedule: (id: string, sendAt?: string) =>
    clientFetch<ApiCampaign>(`${C}/${id}/schedule`, {
      method: "POST",
      body: sendAt ? { sendAt } : {},
    }),
};
