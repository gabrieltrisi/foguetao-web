"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query-string";
import type { Paginated } from "@/types/api/crm";
import type {
  ApiPipeline,
  ApiStage,
  ApiPipelineSetup,
  CustomStageInput,
  ApiDeal,
  ApiDealHistory,
  ApiDealActivity,
  ApiLostReason,
  ApiKanbanBoard,
  ApiKanbanColumn,
  DealPriority,
} from "@/types/api/crm-deals";

const B = "/api/crm/pipelines";
const D = "/api/crm/deals";

export interface CreatePipelineInput {
  name: string;
  description?: string;
  setupMode?: "STANDARD" | "CUSTOM" | "EMPTY";
  stages?: CustomStageInput[];
}

/** Cliente de pipelines/etapas (browser → BFF). */
export const pipelinesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    clientFetch<Paginated<ApiPipeline>>(`${B}${buildQuery(params)}`),
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

  /** Board do Kanban (primeira página por coluna). */
  kanbanBoard: (pipelineId: string, limit = 20) =>
    clientFetch<ApiKanbanBoard>(`${B}/${pipelineId}/kanban${buildQuery({ limit })}`),
  /** Carregar mais de UMA coluna (cursor independente). */
  kanbanColumn: (pipelineId: string, stageId: string, params: { limit?: number; cursor?: string }) =>
    clientFetch<ApiKanbanColumn>(`${B}/${pipelineId}/kanban/stages/${stageId}${buildQuery(params)}`),
};

export interface DealActionInput {
  expectedVersion: number;
}

/**
 * Entrada de criação/edição de oportunidade. `value` é STRING decimal — a
 * conversão para number nunca acontece fora da formatação de apresentação.
 */
export interface DealInput {
  title?: string;
  description?: string;
  value?: string;
  currency?: string;
  priority?: DealPriority;
  source?: string;
  expectedCloseDate?: string;
  pipelineId?: string;
  stageId?: string;
  contactId?: string | null;
  organizationId?: string | null;
  assignedToUserId?: string | null;
  /** Optimistic locking opcional no PATCH. */
  expectedVersion?: number;
}

/** Cliente de oportunidades (browser → BFF). */
export const dealsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    clientFetch<Paginated<ApiDeal>>(`${D}${buildQuery(params)}`),
  get: (id: string) => clientFetch<ApiDeal>(`${D}/${id}`),
  create: (body: DealInput) => clientFetch<ApiDeal>(D, { method: "POST", body }),
  update: (id: string, body: DealInput) => clientFetch<ApiDeal>(`${D}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch(`${D}/${id}`, { method: "DELETE" }),

  move: (id: string, body: DealActionInput & { toStageId: string; reason?: string }) =>
    clientFetch<ApiDeal>(`${D}/${id}/move`, { method: "POST", body }),
  win: (id: string, body: DealActionInput & { stageId?: string }) =>
    clientFetch<ApiDeal>(`${D}/${id}/win`, { method: "POST", body }),
  lose: (id: string, body: DealActionInput & { lostReasonId?: string; lostReasonText?: string; stageId?: string }) =>
    clientFetch<ApiDeal>(`${D}/${id}/lose`, { method: "POST", body }),
  reopen: (id: string, body: DealActionInput & { toStageId?: string }) =>
    clientFetch<ApiDeal>(`${D}/${id}/reopen`, { method: "POST", body }),
  archive: (id: string, body: DealActionInput) =>
    clientFetch<ApiDeal>(`${D}/${id}/archive`, { method: "POST", body }),
  restore: (id: string, body: DealActionInput) =>
    clientFetch<ApiDeal>(`${D}/${id}/restore`, { method: "POST", body }),

  history: (id: string) => clientFetch<ApiDealHistory[]>(`${D}/${id}/history`),
  activities: (id: string, params?: { page?: number; limit?: number }) =>
    clientFetch<Paginated<ApiDealActivity>>(`${D}/${id}/activities${buildQuery(params)}`),
  lostReasons: () => clientFetch<ApiLostReason[]>(`/api/crm/lost-reasons`),
};
