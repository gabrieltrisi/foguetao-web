"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/marketing/client";
import { queryKeys, marketingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { CampaignAction, CampaignFilters, CampaignInput } from "@/types/api/marketing";

/**
 * Campanhas. `campaigns.read` é exigido para listar/detalhar; sem ela a query
 * nem sai e a tela mostra o estado de permissão negada.
 */
export function useCampaigns(filters?: CampaignFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.marketing.campaigns(filters), activeCompanyId],
    queryFn: () => campaignsApi.list(filters),
    enabled: Boolean(activeCompanyId) && can("campaigns.read"),
    placeholderData: (prev) => prev,
  });
}

export function useCampaign(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.marketing.campaign(id), activeCompanyId],
    queryFn: () => campaignsApi.get(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("campaigns.read"),
  });
}

/** Toda mutação invalida a campanha e TODAS as listas (status/filtros mudam). */
function useCampaignInvalidation() {
  const qc = useQueryClient();
  return (id?: string) => {
    if (id) qc.invalidateQueries({ queryKey: marketingInvalidation.campaign(id) });
    qc.invalidateQueries({ queryKey: marketingInvalidation.allCampaigns });
  };
}

export function useCreateCampaign() {
  const invalidate = useCampaignInvalidation();
  return useMutation({
    mutationFn: (body: CampaignInput) => campaignsApi.create(body),
    onSuccess: (c) => invalidate(c.id),
  });
}

export function useUpdateCampaign(id: string) {
  const invalidate = useCampaignInvalidation();
  return useMutation({
    mutationFn: (body: CampaignInput) => campaignsApi.update(id, body),
    onSuccess: () => invalidate(id),
  });
}

/**
 * Ação de status. A UI só oferece transições válidas, mas o BACKEND continua
 * sendo a autoridade: uma transição inválida volta 409 e vira toast.
 */
export function useCampaignAction(id: string) {
  const invalidate = useCampaignInvalidation();
  return useMutation({
    mutationFn: (action: CampaignAction) => campaignsApi.action(id, action),
    onSuccess: () => invalidate(id),
  });
}

export function useDeleteCampaign() {
  const invalidate = useCampaignInvalidation();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.remove(id),
    onSuccess: () => invalidate(),
  });
}
