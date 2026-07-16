"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiCampaign,
  ApiCampaignList,
  CampaignAction,
  CampaignFilters,
  CampaignInput,
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
