import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import {
  pipelineSchema,
  pipelineListSchema,
  pipelineSetupResponseSchema,
  stageSchema,
  stageListSchema,
  dealSchema,
  dealListSchema,
  dealHistoryListSchema,
  dealActivityListSchema,
  lostReasonListSchema,
  kanbanBoardSchema,
  kanbanColumnSchema,
} from "@/types/api/crm-deals";

interface Ctx {
  token: string;
  companyId: string;
}

/** Pipelines e etapas (Sprint 1.0C-1). */
export const pipelinesService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/pipelines${buildQuery(params)}`, { token, companyId, schema: pipelineListSchema }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/pipelines/${id}`, { token, companyId, schema: pipelineSchema }),
  /** POST /pipelines → PipelineSetupResponseDto (setupMode STANDARD | CUSTOM | EMPTY). */
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/pipelines`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: pipelineSetupResponseSchema,
    }),
  /** POST /pipelines/:id/setup → configura pipeline vazio (STANDARD | CUSTOM). */
  setup: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/pipelines/${id}/setup`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: pipelineSetupResponseSchema,
    }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/pipelines/${id}`, { method: "PATCH", token, companyId, body, schema: pipelineSchema }),
  setDefault: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/pipelines/${id}/set-default`, { method: "POST", token, companyId }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/pipelines/${id}`, { method: "DELETE", token, companyId }),

  /* Etapas */
  listStages: ({ token, companyId }: Ctx, pipelineId: string) =>
    backendFetch(`/pipelines/${pipelineId}/stages`, { token, companyId, schema: stageListSchema }),
  createStage: ({ token, companyId }: Ctx, pipelineId: string, body: unknown) =>
    backendFetch(`/pipelines/${pipelineId}/stages`, {
      method: "POST",
      token,
      companyId,
      body,
      schema: stageSchema,
    }),
  updateStage: ({ token, companyId }: Ctx, pipelineId: string, stageId: string, body: unknown) =>
    backendFetch(`/pipelines/${pipelineId}/stages/${stageId}`, {
      method: "PATCH",
      token,
      companyId,
      body,
      schema: stageSchema,
    }),
  deleteStage: ({ token, companyId }: Ctx, pipelineId: string, stageId: string) =>
    backendFetch(`/pipelines/${pipelineId}/stages/${stageId}`, { method: "DELETE", token, companyId }),
  /** POST /pipelines/:id/stages/reorder — conjunto COMPLETO de ids na nova ordem. */
  reorderStages: ({ token, companyId }: Ctx, pipelineId: string, orderedStageIds: string[]) =>
    backendFetch(`/pipelines/${pipelineId}/stages/reorder`, {
      method: "POST",
      token,
      companyId,
      body: { orderedStageIds },
    }),

  /* Kanban — board e paginação por cursor de UMA coluna. */
  kanbanBoard: ({ token, companyId }: Ctx, pipelineId: string, params?: QueryParams) =>
    backendFetch(`/pipelines/${pipelineId}/kanban${buildQuery(params)}`, {
      token,
      companyId,
      schema: kanbanBoardSchema,
    }),
  kanbanColumn: ({ token, companyId }: Ctx, pipelineId: string, stageId: string, params?: QueryParams) =>
    backendFetch(`/pipelines/${pipelineId}/kanban/stages/${stageId}${buildQuery(params)}`, {
      token,
      companyId,
      schema: kanbanColumnSchema,
    }),
};

/** Oportunidades (deals) e recursos relacionados. */
export const dealsService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/deals${buildQuery(params)}`, { token, companyId, schema: dealListSchema }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/deals/${id}`, { token, companyId, schema: dealSchema }),
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/deals`, { method: "POST", token, companyId, body, schema: dealSchema }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}`, { method: "PATCH", token, companyId, body, schema: dealSchema }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/deals/${id}`, { method: "DELETE", token, companyId }),

  /** Ações com optimistic locking — expectedVersion é OBRIGATÓRIO. */
  move: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/move`, { method: "POST", token, companyId, body, schema: dealSchema }),
  win: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/win`, { method: "POST", token, companyId, body, schema: dealSchema }),
  lose: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/lose`, { method: "POST", token, companyId, body, schema: dealSchema }),
  reopen: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/reopen`, { method: "POST", token, companyId, body, schema: dealSchema }),
  archive: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/archive`, { method: "POST", token, companyId, body, schema: dealSchema }),
  restore: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/deals/${id}/restore`, { method: "POST", token, companyId, body, schema: dealSchema }),

  /** Lazy: só carregados ao abrir o detalhe. */
  history: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/deals/${id}/history`, { token, companyId, schema: dealHistoryListSchema }),
  activities: ({ token, companyId }: Ctx, id: string, params?: QueryParams) =>
    backendFetch(`/deals/${id}/activities${buildQuery(params)}`, {
      token,
      companyId,
      schema: dealActivityListSchema,
    }),

  lostReasons: ({ token, companyId }: Ctx) =>
    backendFetch(`/lost-reasons`, { token, companyId, schema: lostReasonListSchema }),
};
