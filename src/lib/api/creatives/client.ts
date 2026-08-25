"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiCreative,
  ApiCreativeList,
  CreativeListParams,
  GenerateCreativeInput,
} from "@/types/api/creatives";

const C = "/api/creatives";

/** Cliente de Criativos (browser → BFF). Nunca fala com o backend direto. */
export const creativesApi = {
  list: (params?: CreativeListParams) =>
    clientFetch<ApiCreativeList>(`${C}${buildQuery(params as QueryParams)}`),
  generate: (body: GenerateCreativeInput) =>
    clientFetch<ApiCreative>(C, { method: "POST", body }),
  remove: (id: string) => clientFetch<void>(`${C}/${id}`, { method: "DELETE" }),
};
