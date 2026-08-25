import "server-only";

import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { creativeListSchema, creativeSchema } from "@/types/api/creatives";

interface Ctx {
  token: string;
  companyId: string;
}

const BASE = "/creatives";

/** Criativos (geração de imagem por IA). Fala com o backend `/creatives` (server-only). */
export const creativesService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`${BASE}${buildQuery(params)}`, {
      token,
      companyId,
      schema: creativeListSchema,
    }),
  generate: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(BASE, { method: "POST", token, companyId, body, schema: creativeSchema }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`${BASE}/${id}`, { method: "DELETE", token, companyId }),
};
