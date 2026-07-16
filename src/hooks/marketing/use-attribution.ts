"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attributionApi } from "@/lib/api/marketing/client";
import { queryKeys, marketingInvalidation, crmInvalidation } from "@/lib/query/keys";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type { AttributionInput, AttributionPatch } from "@/types/api/marketing";

/**
 * Atribuição — histórico de touchpoints.
 *
 * `firstTouch`/`lastTouch` vêm DERIVADOS do backend: o front nunca recalcula,
 * senão poderia divergir do histórico.
 */
export function useContactAttributions(contactId: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.marketing.contactAttributions(contactId), activeCompanyId],
    queryFn: () => attributionApi.listByContact(contactId),
    enabled:
      Boolean(activeCompanyId) && Boolean(contactId) && can(PERMISSIONS.MARKETING_ATTRIBUTION_READ),
  });
}

/** Leads da campanha. Exige as DUAS permissões, como o backend. */
export function useCampaignAttributions(
  campaignId: string,
  filters?: { page?: number; limit?: number },
) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.marketing.campaignAttributions(campaignId, filters), activeCompanyId],
    queryFn: () => attributionApi.listByCampaign(campaignId, filters),
    enabled:
      Boolean(activeCompanyId) &&
      Boolean(campaignId) &&
      can(PERMISSIONS.MARKETING_ATTRIBUTION_READ) &&
      can(PERMISSIONS.CAMPAIGNS_READ),
    placeholderData: (prev) => prev,
  });
}

/**
 * Uma escrita de atribuição mexe em três lugares: o histórico do contato, as
 * listas de leads das campanhas e — porque a 1ª atribuição pode preencher
 * `Contact.source` no backend — o próprio contato.
 */
function useAttributionInvalidation(contactId?: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: marketingInvalidation.allAttributions });
    if (contactId) qc.invalidateQueries({ queryKey: crmInvalidation.contact(contactId) });
  };
}

export function useCreateAttribution(contactId: string) {
  const invalidate = useAttributionInvalidation(contactId);
  return useMutation({
    mutationFn: (body: AttributionInput) => attributionApi.create(contactId, body),
    onSuccess: invalidate,
  });
}

/** Só o vínculo: UTMs e data de captura são imutáveis (400 no BFF). */
export function useUpdateAttribution(id: string, contactId?: string) {
  const invalidate = useAttributionInvalidation(contactId);
  return useMutation({
    mutationFn: (body: AttributionPatch) => attributionApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteAttribution(contactId?: string) {
  const invalidate = useAttributionInvalidation(contactId);
  return useMutation({
    mutationFn: (id: string) => attributionApi.remove(id),
    onSuccess: invalidate,
  });
}
