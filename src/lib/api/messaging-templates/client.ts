"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type {
  ApiMessageTemplate,
  ApiMessageTemplateList,
  CreateMessageTemplateInput,
  MessageTemplateFilters,
  UpdateMessageTemplateInput,
} from "@/types/api/messaging-templates";

const T = "/api/messaging/templates";

/** Cliente de Templates (browser → BFF). Nunca fala com o backend direto. */
export const messageTemplatesApi = {
  list: (filters?: MessageTemplateFilters) =>
    clientFetch<ApiMessageTemplateList>(`${T}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiMessageTemplate>(`${T}/${id}`),
  create: (body: CreateMessageTemplateInput) =>
    clientFetch<ApiMessageTemplate>(T, { method: "POST", body }),
  update: (id: string, body: UpdateMessageTemplateInput) =>
    clientFetch<ApiMessageTemplate>(`${T}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch<void>(`${T}/${id}`, { method: "DELETE" }),
};
