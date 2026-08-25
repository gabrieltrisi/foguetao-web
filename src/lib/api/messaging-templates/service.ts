import "server-only";

import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  messageTemplateListSchema,
  messageTemplateSchema,
} from "@/types/api/messaging-templates";

interface Ctx {
  token: string;
  companyId: string;
}

const BASE = "/messaging/templates";

/** Templates de mensagem. Fala com o backend `messaging/templates` (server-only). */
export const messageTemplatesService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`${BASE}${buildQuery(params)}`, {
      token,
      companyId,
      schema: messageTemplateListSchema,
    }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}`, { token, companyId, schema: messageTemplateSchema }),
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(BASE, { method: "POST", token, companyId, body, schema: messageTemplateSchema }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`${BASE}/${id}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: messageTemplateSchema,
    }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}`, { method: "DELETE", token, companyId }),
};
