"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dealsApi, type DealActionInput } from "@/lib/api/crm-deals/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/* ---------- Queries ---------- */

export function useDeals(filters?: Record<string, string | number | undefined>) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.deals(filters), activeCompanyId],
    queryFn: () => dealsApi.list(filters),
    enabled: Boolean(activeCompanyId) && can("crm.deals.read"),
    placeholderData: (prev) => prev,
  });
}

export function useDeal(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.deal(id), activeCompanyId],
    queryFn: () => dealsApi.get(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("crm.deals.read"),
  });
}

/**
 * Histórico de etapas — LAZY: só é buscado quando `enabled` (detalhe aberto).
 * Nunca acompanha o Kanban.
 */
export function useDealHistory(id: string, enabled = true) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.dealHistory(id), activeCompanyId],
    queryFn: () => dealsApi.history(id),
    enabled: enabled && Boolean(activeCompanyId) && Boolean(id) && can("crm.deals.read"),
  });
}

/** Timeline de atividades — LAZY, igual ao histórico. */
export function useDealActivities(id: string, enabled = true) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.dealActivities(id), activeCompanyId],
    queryFn: () => dealsApi.activities(id, { limit: 20 }),
    enabled: enabled && Boolean(activeCompanyId) && Boolean(id) && can("crm.deals.read"),
  });
}

export function useLostReasons() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.lostReasons(), activeCompanyId],
    queryFn: () => dealsApi.lostReasons(),
    enabled: Boolean(activeCompanyId) && can("crm.pipelines.read"),
  });
}

/* ---------- Mutations ---------- */

/** Invalida o deal, a lista e o board do pipeline afetado. */
function useInvalidateDeal(id?: string, pipelineId?: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: crmInvalidation.allDeals });
    if (id) qc.invalidateQueries({ queryKey: crmInvalidation.deal(id) });
    if (pipelineId) qc.invalidateQueries({ queryKey: crmInvalidation.kanban(pipelineId) });
  };
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => dealsApi.create(body),
    onSuccess: (deal) => {
      qc.invalidateQueries({ queryKey: crmInvalidation.allDeals });
      qc.invalidateQueries({ queryKey: crmInvalidation.kanban(deal.pipelineId) });
    },
  });
}

export function useUpdateDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: unknown) => dealsApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allDeals }),
  });
}

/* Ações com optimistic locking (expectedVersion obrigatório). */

export function useWinDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: DealActionInput & { stageId?: string }) => dealsApi.win(id, body),
    onSuccess: invalidate,
  });
}

export function useLoseDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: DealActionInput & { lostReasonId?: string; lostReasonText?: string }) =>
      dealsApi.lose(id, body),
    onSuccess: invalidate,
  });
}

export function useReopenDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: DealActionInput & { toStageId?: string }) => dealsApi.reopen(id, body),
    onSuccess: invalidate,
  });
}

export function useArchiveDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: DealActionInput) => dealsApi.archive(id, body),
    onSuccess: invalidate,
  });
}

export function useRestoreDeal(id: string, pipelineId?: string) {
  const invalidate = useInvalidateDeal(id, pipelineId);
  return useMutation({
    mutationFn: (body: DealActionInput) => dealsApi.restore(id, body),
    onSuccess: invalidate,
  });
}
