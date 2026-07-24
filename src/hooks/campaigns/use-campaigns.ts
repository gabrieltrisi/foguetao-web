"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns/client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSession } from "@/providers/session-provider";
import type {
  ApiCampaign,
  AudienceSpec,
  CampaignFilters,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "@/types/api/campaigns";

const KEY = "messaging-campaigns";
const listKey = (filters?: CampaignFilters) => [KEY, "list", filters ?? {}] as const;
const oneKey = (id: string) => [KEY, "one", id] as const;

/* ---------- Queries ---------- */

export function useCampaigns(filters?: CampaignFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...listKey(filters), activeCompanyId],
    queryFn: () => campaignsApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
  });
}

export function useCampaign(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...oneKey(id ?? "none"), activeCompanyId],
    queryFn: () => campaignsApi.get(id as string),
    enabled:
      Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
  });
}

/* ---------- Mutations ---------- */

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: [KEY, "list"] });
    if (id) qc.invalidateQueries({ queryKey: [KEY, "one", id] });
  };
}

export function useCreateCampaign() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: CreateCampaignInput) => campaignsApi.create(body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: UpdateCampaignInput) => campaignsApi.update(id, body),
    onSuccess: (c: ApiCampaign) => invalidate(c.id),
  });
}

export function useDeleteCampaign() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.remove(id),
    onSuccess: () => invalidate(),
  });
}

export function useDuplicateCampaign() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => campaignsApi.duplicate(id),
    onSuccess: (c: ApiCampaign) => invalidate(c.id),
  });
}

/** Prévia do público (mutation — chamada ao vivo no wizard, não persiste). */
export function usePreviewAudience(id: string) {
  return useMutation({
    mutationFn: (audience?: AudienceSpec) => campaignsApi.previewAudience(id, audience),
  });
}

export function useScheduleCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (sendAt?: string) => campaignsApi.schedule(id, sendAt),
    onSuccess: (c: ApiCampaign) => invalidate(c.id),
  });
}
