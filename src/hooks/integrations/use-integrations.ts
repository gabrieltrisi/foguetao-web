"use client";

import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { integrationsApi } from "@/lib/api/integrations/client";
import { queryKeys, integrationsInvalidation } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type {
  CatalogFilters,
  ConnectionFilters,
  CreateConnectionInput,
  LogFilters,
  UpdateConnectionInput,
} from "@/types/api/integrations";

/** O catálogo só muda com deploy (é código, não dado da empresa). */
const CATALOG_STALE_MS = 10 * 60 * 1000;

/* ---------- Queries ---------- */

export function useIntegrationCatalog(filters?: CatalogFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.catalog(filters), activeCompanyId],
    queryFn: () => integrationsApi.catalog(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
    staleTime: CATALOG_STALE_MS,
    placeholderData: (prev) => prev,
  });
}

export function useCatalogItem(key: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.catalogItem(key), activeCompanyId],
    queryFn: () => integrationsApi.catalogItem(key),
    enabled:
      Boolean(activeCompanyId) && Boolean(key) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useConnections(filters?: ConnectionFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.connections(filters), activeCompanyId],
    queryFn: () => integrationsApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
    placeholderData: (prev) => prev,
  });
}

export function useConnection(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.connection(id), activeCompanyId],
    queryFn: () => integrationsApi.get(id),
    enabled:
      Boolean(activeCompanyId) && Boolean(id) && can(PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ),
  });
}

/** Logs exigem `integrations.logs.read` — permissão distinta da de leitura. */
export function useConnectionLogs(id: string, filters?: LogFilters, enabled = true) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.integrations.logs(id, filters), activeCompanyId],
    queryFn: () => integrationsApi.logs(id, filters),
    enabled:
      enabled && Boolean(activeCompanyId) && Boolean(id) && can(PERMISSIONS.INTEGRATIONS_LOGS_READ),
    placeholderData: (prev) => prev,
  });
}

/* ---------- Mutations ---------- */

/**
 * Escopo das invalidações: tudo abaixo de `integrations/*`. O CRM (contatos,
 * deals, kanban, tarefas) nunca é tocado.
 */
function invalidateConnection(qc: QueryClient, id: string) {
  qc.invalidateQueries({ queryKey: integrationsInvalidation.connection(id) });
}

export function useCreateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConnectionInput) => integrationsApi.create(body),
    // criar muda a composição da lista → invalida só a lista de conexões
    onSuccess: () => qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections }),
  });
}

export function useUpdateConnection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateConnectionInput) => integrationsApi.update(id, body),
    onSuccess: () => {
      // As chaves reais terminam com a empresa ativa, então invalidamos por
      // prefixo — um setQueryData com chave exata não acertaria nada.
      invalidateConnection(qc, id);
      qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections });
    },
  });
}

/**
 * Ativar/pausar: o backend devolve só `{success,status}`, NÃO a conexão — por
 * isso invalidamos o detalhe em vez de escrever a resposta no cache.
 */
export function useConnectConnection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => integrationsApi.connect(id),
    onSuccess: () => {
      invalidateConnection(qc, id);
      qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections });
    },
  });
}

export function useDisconnectConnection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => integrationsApi.disconnect(id),
    onSuccess: () => {
      invalidateConnection(qc, id);
      qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections });
    },
  });
}

/** Testar: gera log e mexe no status/last* → invalida logs e detalhe. */
export function useTestConnection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => integrationsApi.test(id),
    onSettled: () => {
      // `onSettled`: o teste que FALHA também gera log e atualiza lastFailureAt.
      qc.invalidateQueries({ queryKey: integrationsInvalidation.logs(id) });
      invalidateConnection(qc, id);
      qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections });
    },
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => integrationsApi.remove(id),
    onSuccess: (_result, id) => {
      qc.removeQueries({ queryKey: integrationsInvalidation.connection(id) });
      qc.invalidateQueries({ queryKey: integrationsInvalidation.allConnections });
    },
  });
}
