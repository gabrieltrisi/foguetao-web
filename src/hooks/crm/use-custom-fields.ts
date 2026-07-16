"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crmApi, type CustomFieldDefInput } from "@/lib/api/crm/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { CustomFieldEntity } from "@/types/api/crm";

/**
 * Definições e valores de campos personalizados.
 *
 * `useCustomFieldDefs` (associação nos formulários) já existe em
 * `use-crm-meta` e não é duplicado aqui — este módulo cobre a GESTÃO das
 * definições e os valores da ORGANIZAÇÃO (que têm caminho de leitura próprio;
 * os do contato vêm embutidos no detalhe).
 *
 * Invalidação: mexer numa definição invalida as definições E as entidades que
 * exibem valores (contatos/organizações), pois nome/tipo/opções aparecem lá.
 */
function useDefsInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: crmInvalidation.allCustomFieldDefs });
    qc.invalidateQueries({ queryKey: crmInvalidation.allContacts });
    qc.invalidateQueries({ queryKey: crmInvalidation.allOrganizations });
  };
}

/** Lista completa de definições de uma entidade (array puro, sem paginação). */
export function useCustomFieldDefsFor(entityType?: CustomFieldEntity) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.customFieldDefs(entityType), activeCompanyId],
    queryFn: () => crmApi.listCustomFieldDefs(entityType),
    enabled: Boolean(activeCompanyId) && can("crm.custom_fields.read"),
  });
}

export function useCreateCustomFieldDef() {
  const invalidate = useDefsInvalidation();
  return useMutation({
    mutationFn: (body: CustomFieldDefInput) => crmApi.createCustomFieldDef(body),
    onSuccess: invalidate,
  });
}

export function useUpdateCustomFieldDef() {
  const invalidate = useDefsInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CustomFieldDefInput }) =>
      crmApi.updateCustomFieldDef(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteCustomFieldDef() {
  const invalidate = useDefsInvalidation();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteCustomFieldDef(id),
    onSuccess: invalidate,
  });
}

/* ---------- Valores ---------- */

/** Valores da organização (endpoint próprio de leitura). */
export function useOrgCustomFields(organizationId: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.orgCustomFields(organizationId), activeCompanyId],
    queryFn: () => crmApi.getOrgCustomFields(organizationId),
    enabled:
      Boolean(activeCompanyId) && Boolean(organizationId) && can("crm.organizations.read"),
  });
}

/** Grava valores da organização em lote (`null` limpa). */
export function useSetOrgCustomFields(organizationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      crmApi.setOrgCustomFields(organizationId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crm.orgCustomFields(organizationId) });
      qc.invalidateQueries({ queryKey: crmInvalidation.organization(organizationId) });
    },
  });
}
