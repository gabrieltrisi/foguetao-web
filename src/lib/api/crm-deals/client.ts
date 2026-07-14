"use client";

import { clientFetch } from "@/lib/api/client";
import type { Paginated } from "@/types/api/crm";
import type { ApiPipeline, ApiStage, ApiPipelineSetup, CustomStageInput } from "@/types/api/crm-deals";

const B = "/api/crm/pipelines";

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export interface CreatePipelineInput {
  name: string;
  description?: string;
  setupMode?: "STANDARD" | "CUSTOM" | "EMPTY";
  stages?: CustomStageInput[];
}

/** Cliente de pipelines/etapas (browser → BFF). */
export const pipelinesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    clientFetch<Paginated<ApiPipeline>>(`${B}${qs(params)}`),
  get: (id: string) => clientFetch<ApiPipeline>(`${B}/${id}`),
  create: (body: CreatePipelineInput) => clientFetch<ApiPipelineSetup>(B, { method: "POST", body }),
  setup: (id: string, body: { setupMode: "STANDARD" | "CUSTOM"; stages?: CustomStageInput[] }) =>
    clientFetch<ApiPipelineSetup>(`${B}/${id}/setup`, { method: "POST", body }),
  update: (id: string, body: { name?: string; description?: string | null }) =>
    clientFetch<ApiPipeline>(`${B}/${id}`, { method: "PATCH", body }),
  setDefault: (id: string) => clientFetch(`${B}/${id}/set-default`, { method: "POST" }),
  remove: (id: string) => clientFetch(`${B}/${id}`, { method: "DELETE" }),

  listStages: (pipelineId: string) => clientFetch<ApiStage[]>(`${B}/${pipelineId}/stages`),
  createStage: (pipelineId: string, body: CustomStageInput) =>
    clientFetch<ApiStage>(`${B}/${pipelineId}/stages`, { method: "POST", body }),
  updateStage: (pipelineId: string, stageId: string, body: Partial<CustomStageInput>) =>
    clientFetch<ApiStage>(`${B}/${pipelineId}/stages/${stageId}`, { method: "PATCH", body }),
  deleteStage: (pipelineId: string, stageId: string) =>
    clientFetch(`${B}/${pipelineId}/stages/${stageId}`, { method: "DELETE" }),
  reorderStages: (pipelineId: string, orderedStageIds: string[]) =>
    clientFetch(`${B}/${pipelineId}/stages/reorder`, { method: "POST", body: { orderedStageIds } }),
};
