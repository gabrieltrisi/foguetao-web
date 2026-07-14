"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pipelinesApi, type CreatePipelineInput } from "@/lib/api/crm-deals/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import type { CustomStageInput } from "@/types/api/crm-deals";

/* ---------- Queries ---------- */

export function usePipelines(filters?: Record<string, string | number | undefined>) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.pipelines(filters), activeCompanyId],
    queryFn: () => pipelinesApi.list(filters),
    enabled: Boolean(activeCompanyId) && can("crm.pipelines.read"),
    placeholderData: (prev) => prev,
  });
}

export function usePipeline(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.pipeline(id), activeCompanyId],
    queryFn: () => pipelinesApi.get(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("crm.pipelines.read"),
  });
}

/** Etapas do pipeline (ordenadas por posição). */
export function usePipelineStages(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.pipelineStages(id), activeCompanyId],
    queryFn: () => pipelinesApi.listStages(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("crm.stages.read"),
  });
}

/* ---------- Mutations ---------- */

function useInvalidatePipeline(id?: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: crmInvalidation.allPipelines });
    if (id) qc.invalidateQueries({ queryKey: crmInvalidation.pipeline(id) });
  };
}

export function useCreatePipeline() {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: (body: CreatePipelineInput) => pipelinesApi.create(body),
    onSuccess: invalidate,
  });
}

/** Configura um pipeline vazio (STANDARD | CUSTOM). */
export function useSetupPipeline(id: string) {
  const invalidate = useInvalidatePipeline(id);
  return useMutation({
    mutationFn: (body: { setupMode: "STANDARD" | "CUSTOM"; stages?: CustomStageInput[] }) =>
      pipelinesApi.setup(id, body),
    onSuccess: invalidate,
  });
}

export function useUpdatePipeline(id: string) {
  const invalidate = useInvalidatePipeline(id);
  return useMutation({
    mutationFn: (body: { name?: string; description?: string | null }) => pipelinesApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useSetDefaultPipeline() {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: (id: string) => pipelinesApi.setDefault(id),
    onSuccess: invalidate,
  });
}

export function useDeletePipeline() {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: (id: string) => pipelinesApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useCreateStage(pipelineId: string) {
  const invalidate = useInvalidatePipeline(pipelineId);
  return useMutation({
    mutationFn: (body: CustomStageInput) => pipelinesApi.createStage(pipelineId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateStage(pipelineId: string) {
  const invalidate = useInvalidatePipeline(pipelineId);
  return useMutation({
    mutationFn: ({ stageId, ...body }: Partial<CustomStageInput> & { stageId: string }) =>
      pipelinesApi.updateStage(pipelineId, stageId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteStage(pipelineId: string) {
  const invalidate = useInvalidatePipeline(pipelineId);
  return useMutation({
    mutationFn: (stageId: string) => pipelinesApi.deleteStage(pipelineId, stageId),
    onSuccess: invalidate,
  });
}

export function useReorderStages(pipelineId: string) {
  const invalidate = useInvalidatePipeline(pipelineId);
  return useMutation({
    mutationFn: (orderedStageIds: string[]) => pipelinesApi.reorderStages(pipelineId, orderedStageIds),
    onSuccess: invalidate,
  });
}
