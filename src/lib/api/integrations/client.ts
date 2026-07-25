"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type { Paginated } from "@/types/api/crm";
import type {
  ApiCatalog,
  ApiCatalogItem,
  ApiConnectionOperationResult,
  ApiConnectionTestResult,
  ApiIntegrationConnection,
  ApiIntegrationLog,
  CatalogFilters,
  ConnectionFilters,
  CreateConnectionInput,
  LogFilters,
  UpdateConnectionInput,
} from "@/types/api/integrations";
import type {
  ApiEvolutionCapabilities,
  ApiEvolutionConnection,
  ApiEvolutionQr,
  ApiEvolutionWebhookState,
  CreateEvolutionConnectionInput,
} from "@/types/api/evolution";

const I = "/api/integrations";

/** Cliente de integrações (browser → BFF). Nunca fala com o backend direto. */
export const integrationsApi = {
  catalog: (filters?: CatalogFilters) =>
    clientFetch<ApiCatalog>(`${I}/catalog${buildQuery(filters as QueryParams)}`),
  catalogItem: (key: string) => clientFetch<ApiCatalogItem>(`${I}/catalog/${encodeURIComponent(key)}`),

  list: (filters?: ConnectionFilters) =>
    clientFetch<Paginated<ApiIntegrationConnection>>(
      `${I}/connections${buildQuery(filters as QueryParams)}`,
    ),
  get: (id: string) => clientFetch<ApiIntegrationConnection>(`${I}/connections/${id}`),
  create: (body: CreateConnectionInput) =>
    clientFetch<ApiIntegrationConnection>(`${I}/connections`, { method: "POST", body }),
  update: (id: string, body: UpdateConnectionInput) =>
    clientFetch<ApiIntegrationConnection>(`${I}/connections/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch<{ message: string }>(`${I}/connections/${id}`, { method: "DELETE" }),

  connect: (id: string) =>
    clientFetch<ApiConnectionOperationResult>(`${I}/connections/${id}/connect`, { method: "POST" }),
  disconnect: (id: string) =>
    clientFetch<ApiConnectionOperationResult>(`${I}/connections/${id}/disconnect`, { method: "POST" }),
  test: (id: string) =>
    clientFetch<ApiConnectionTestResult>(`${I}/connections/${id}/test`, { method: "POST" }),

  logs: (id: string, filters?: LogFilters) =>
    clientFetch<Paginated<ApiIntegrationLog>>(
      `${I}/connections/${id}/logs${buildQuery(filters as QueryParams)}`,
    ),
};

const E = "/api/integrations/evolution";

/**
 * Cliente de onboarding Evolution (browser → BFF). Nunca fala com o backend
 * direto. A apiKey só trafega no corpo do `create` (write-only) e jamais retorna.
 */
export const evolutionApi = {
  capabilities: () => clientFetch<ApiEvolutionCapabilities>(`${E}/capabilities`),

  create: (body: CreateEvolutionConnectionInput) =>
    clientFetch<ApiEvolutionConnection>(`${E}/connections`, { method: "POST", body }),
  get: (id: string) => clientFetch<ApiEvolutionConnection>(`${E}/connections/${id}`),
  state: (id: string) => clientFetch<ApiEvolutionConnection>(`${E}/connections/${id}/state`),
  connect: (id: string) =>
    clientFetch<ApiEvolutionConnection>(`${E}/connections/${id}/connect`, { method: "POST" }),
  disconnect: (id: string) =>
    clientFetch<ApiEvolutionConnection>(`${E}/connections/${id}/disconnect`, { method: "POST" }),

  qr: (id: string) => clientFetch<ApiEvolutionQr>(`${E}/connections/${id}/qr`),

  webhookState: (id: string) =>
    clientFetch<ApiEvolutionWebhookState>(`${E}/connections/${id}/webhook`),
  configureWebhook: (id: string) =>
    clientFetch<ApiEvolutionWebhookState>(`${E}/connections/${id}/webhook/configure`, {
      method: "POST",
    }),
};
