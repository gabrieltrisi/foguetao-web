"use client";

import { clientFetch } from "@/lib/api/client";
import { buildQuery, type QueryParams } from "@/lib/api/query-string";
import type { Paginated } from "@/types/api/crm";
import type { ApiTask, CreateTaskInput, UpdateTaskInput, TaskFilters } from "@/types/api/crm-tasks";

const T = "/api/crm/tasks";

/** Cliente de tarefas (browser → BFF). */
export const tasksApi = {
  list: (filters?: TaskFilters) => clientFetch<Paginated<ApiTask>>(`${T}${buildQuery(filters as QueryParams)}`),
  get: (id: string) => clientFetch<ApiTask>(`${T}/${id}`),
  create: (body: CreateTaskInput) => clientFetch<ApiTask>(T, { method: "POST", body }),
  update: (id: string, body: UpdateTaskInput) => clientFetch<ApiTask>(`${T}/${id}`, { method: "PATCH", body }),
  remove: (id: string) => clientFetch<{ message: string }>(`${T}/${id}`, { method: "DELETE" }),

  assign: (id: string, assignedToUserId: string) =>
    clientFetch<ApiTask>(`${T}/${id}/assign`, { method: "POST", body: { assignedToUserId } }),
  /** Sem corpo — o backend não usa expectedVersion em tarefas. */
  complete: (id: string) => clientFetch<ApiTask>(`${T}/${id}/complete`, { method: "POST" }),
  reopen: (id: string) => clientFetch<ApiTask>(`${T}/${id}/reopen`, { method: "POST" }),
};
