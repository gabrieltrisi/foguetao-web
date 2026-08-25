"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadSourcesApi } from "@/lib/api/marketing/client";
import { queryKeys, marketingInvalidation } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { LeadSourceFilters, LeadSourceInput } from "@/types/api/marketing";

/**
 * Catálogo de origens da empresa.
 *
 * RBAC real: ler exige `marketing.lead_sources.read`; qualquer escrita (criar,
 * editar, excluir e o setup) exige `marketing.lead_sources.manage`.
 */
export function useLeadSources(filters?: LeadSourceFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.marketing.leadSources(filters), activeCompanyId],
    queryFn: () => leadSourcesApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.MARKETING_LEAD_SOURCES_READ),
    placeholderData: (prev) => prev,
  });
}

/** Origens ATIVAS — é o que os seletores de atribuição podem oferecer. */
export function useActiveLeadSources() {
  return useLeadSources({ active: true });
}

/**
 * Toda escrita invalida o catálogo inteiro E as atribuições: o nome/kind da
 * origem aparece dentro de cada touchpoint já carregado.
 */
function useLeadSourceInvalidation() {
  const qc = useQueryClient();
  return (id?: string) => {
    if (id) qc.invalidateQueries({ queryKey: marketingInvalidation.leadSource(id) });
    qc.invalidateQueries({ queryKey: marketingInvalidation.allLeadSources });
    qc.invalidateQueries({ queryKey: marketingInvalidation.allAttributions });
  };
}

export function useSetupLeadSources() {
  const invalidate = useLeadSourceInvalidation();
  return useMutation({
    mutationFn: () => leadSourcesApi.setup(),
    onSuccess: () => invalidate(),
  });
}

export function useCreateLeadSource() {
  const invalidate = useLeadSourceInvalidation();
  return useMutation({
    mutationFn: (body: LeadSourceInput) => leadSourcesApi.create(body),
    onSuccess: (s) => invalidate(s.id),
  });
}

export function useUpdateLeadSource(id: string) {
  const invalidate = useLeadSourceInvalidation();
  return useMutation({
    mutationFn: (body: LeadSourceInput) => leadSourcesApi.update(id, body),
    onSuccess: () => invalidate(id),
  });
}

/** O backend recusa origem padrão (409) ou em uso (409) — a UI mostra o motivo. */
export function useDeleteLeadSource() {
  const invalidate = useLeadSourceInvalidation();
  return useMutation({
    mutationFn: (id: string) => leadSourcesApi.remove(id),
    onSuccess: () => invalidate(),
  });
}
