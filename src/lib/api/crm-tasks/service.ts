import "server-only";
import { backendFetch } from "@/lib/api/http";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import { taskSchema, taskListSchema } from "@/types/api/crm-tasks";

interface Ctx {
  token: string;
  companyId: string;
}

/**
 * Tarefas (Sprint 1.0C-3). `complete` e `reopen` NÃO possuem corpo — o
 * backend não usa optimistic locking neste domínio.
 */
export const tasksService = {
  list: ({ token, companyId }: Ctx, params?: QueryParams) =>
    backendFetch(`/tasks${buildQuery(params)}`, { token, companyId, schema: taskListSchema }),
  get: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tasks/${id}`, { token, companyId, schema: taskSchema }),
  create: ({ token, companyId }: Ctx, body: unknown) =>
    backendFetch(`/tasks`, { method: "POST", token, companyId, body, schema: taskSchema }),
  update: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/tasks/${id}`, { method: "PATCH", token, companyId, body, schema: taskSchema }),
  remove: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tasks/${id}`, { method: "DELETE", token, companyId }),

  assign: ({ token, companyId }: Ctx, id: string, body: unknown) =>
    backendFetch(`/tasks/${id}/assign`, { method: "POST", token, companyId, body, schema: taskSchema }),
  complete: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tasks/${id}/complete`, { method: "POST", token, companyId, schema: taskSchema }),
  reopen: ({ token, companyId }: Ctx, id: string) =>
    backendFetch(`/tasks/${id}/reopen`, { method: "POST", token, companyId, schema: taskSchema }),
};
