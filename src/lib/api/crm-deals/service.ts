import "server-only";
import { backendFetch } from "@/lib/api/http";
import {
  pipelineSchema,
  pipelineListSchema,
  pipelineSetupResponseSchema,
  stageSchema,
  stageListSchema,
} from "@/types/api/crm-deals";

type Params = Record<string, string | string[] | number | boolean | undefined | null>;

function qs(params?: Params): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((i) => sp.append(k, i));
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

interface Ctx {
  token: string;
  companyId: string;
}

/** Pipelines e etapas (Sprint 1.0C-1). */
export const pipelinesService = {
  list: ({ token, companyId }: Ctx, params?: Params) =>
    backendFetch(`/pipelines${qs(params)}`, { token, companyId, schema: pipelineListSchema }),
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
};
