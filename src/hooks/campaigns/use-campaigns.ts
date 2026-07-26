"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns/client";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { campaignKeys, invalidateCampaign } from "@/lib/campaigns/query-keys";
import { useSession } from "@/providers/session-provider";
import type {
  ApiCampaign,
  CampaignStatus,
  AudienceSpec,
  CampaignFilters,
  CreateCampaignInput,
  RecipientFilters,
  UpdateCampaignInput,
} from "@/types/api/campaigns";

/* ---------- Queries ---------- */

export function useCampaigns(filters?: CampaignFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...campaignKeys.list(filters), activeCompanyId],
    queryFn: () => campaignsApi.list(filters),
    enabled: Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
    placeholderData: (prev) => prev,
  });
}

export function useCampaign(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...campaignKeys.detail(id ?? "none"), activeCompanyId],
    queryFn: () => campaignsApi.get(id as string),
    enabled: Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
  });
}

/** Estados em que faz sentido acompanhar métricas ao vivo (polling de segurança). */
const LIVE_STATUSES: CampaignStatus[] = ["SCHEDULED", "PREPARING", "SENDING", "PAUSED"];
const METRICS_POLL_MS = 6_000;

/**
 * Métricas reais da campanha. Realtime é o caminho principal; este polling é o
 * FALLBACK durante a execução (para/reduz ao concluir). `live` liga o polling.
 */
export function useCampaignMetrics(id: string | null, status?: CampaignStatus) {
  const { activeCompanyId, can } = useSession();
  const live = status ? LIVE_STATUSES.includes(status) : false;
  return useQuery({
    queryKey: [...campaignKeys.metrics(id ?? "none"), activeCompanyId],
    queryFn: () => campaignsApi.metrics(id as string),
    enabled:
      Boolean(id) &&
      Boolean(activeCompanyId) &&
      can(PERMISSIONS.MESSAGING_CAMPAIGNS_METRICS_READ),
    refetchInterval: live ? METRICS_POLL_MS : false,
    placeholderData: (prev) => prev,
  });
}

export function useCampaignTimeline(id: string | null) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...campaignKeys.timeline(id ?? "none"), activeCompanyId],
    queryFn: () => campaignsApi.timeline(id as string),
    enabled: Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
  });
}

export function useCampaignRecipients(id: string | null, filters?: RecipientFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...campaignKeys.recipients(id ?? "none", filters), activeCompanyId],
    queryFn: () => campaignsApi.recipients(id as string, filters),
    enabled: Boolean(id) && Boolean(activeCompanyId) && can(PERMISSIONS.MESSAGING_CAMPAIGNS_READ),
    placeholderData: (prev) => prev,
  });
}

/* ---------- Mutations ---------- */

function useInvalidate() {
  const qc = useQueryClient();
  const inv = (key: readonly unknown[]) => qc.invalidateQueries({ queryKey: key });
  return (id?: string, opts?: { recipients?: boolean }) => {
    inv(campaignKeys.lists());
    if (id) invalidateCampaign(inv, id, opts);
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

/* ---------- Execução (Sprint C2B) — atualizam após a resposta do backend ------
 * Invalidam em onSETTLED (sucesso E erro): num 409 (estado mudou sob o usuário)
 * o refetch já traz o status real, sincronizando a UI sem falha silenciosa. */

export function useSendNowCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => campaignsApi.sendNow(id),
    onSettled: () => invalidate(id),
  });
}

export function usePauseCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => campaignsApi.pause(id),
    onSettled: () => invalidate(id),
  });
}

export function useResumeCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => campaignsApi.resume(id),
    onSettled: () => invalidate(id),
  });
}

export function useCancelCampaign(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => campaignsApi.cancel(id),
    onSettled: () => invalidate(id, { recipients: true }),
  });
}
