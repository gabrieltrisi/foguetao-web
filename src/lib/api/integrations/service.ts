import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  catalogSchema,
  catalogItemSchema,
  connectionOperationResultSchema,
  connectionTestResultSchema,
  integrationConnectionSchema,
  integrationConnectionListSchema,
  integrationLogListSchema,
} from "@/types/api/integrations";

interface Ctx {
  token: string;
  companyId: string;
}

/**
 * Integrações (Sprint 1.0D-1). Fala com os endpoints REAIS do backend:
 * `connect`/`disconnect` são o que a UI chama de ativar/pausar — o backend não
 * tem status `PAUSED`, e inventar um aqui quebraria o contrato.
 *
 * Nenhum método devolve credencial: o backend só expõe `credentialsSummary`.
 */
export const integrationsService = {
  catalog: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/integrations/catalog${buildQuery(params)}`, {
      token,
      companyId,
      schema: catalogSchema,
    }),
  catalogItem: ({ token, companyId }: Ctx, key: string) =>
    backendFetch(`/integrations/catalog/${encodeURIComponent(key)}`, {
      token,
      companyId,
      schema: catalogItemSchema,
    }),

  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/integrations${buildQuery(params)}`, {
      token,
      companyId,
      schema: integrationConnectionListSchema,
    }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/integrations/${id}`, { token, companyId, schema: integrationConnectionSchema }),
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/integrations`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: integrationConnectionSchema,
    }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/integrations/${id}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: integrationConnectionSchema,
    }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/integrations/${id}`, { method: "DELETE", token, companyId }),

  /** Ativar. Sem corpo. Devolve o resultado da operação, NÃO a conexão. */
  connect: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/integrations/${id}/connect`, {
      method: "POST",
      token,
      companyId,
      schema: connectionOperationResultSchema,
    }),
  /** Pausar. Sem corpo. Devolve o resultado da operação, NÃO a conexão. */
  disconnect: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/integrations/${id}/disconnect`, {
      method: "POST",
      token,
      companyId,
      schema: connectionOperationResultSchema,
    }),
  /** Testar estrutura. Sem corpo; nenhuma chamada externa no modo MOCK. */
  test: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/integrations/${id}/test`, {
      method: "POST",
      token,
      companyId,
      schema: connectionTestResultSchema,
    }),

  logs: ({ token, companyId }: Ctx, id: string, params?: QueryParams) =>
    backendFetch(`/integrations/${id}/logs${buildQuery(params)}`, {
      token,
      companyId,
      schema: integrationLogListSchema,
    }),
};
