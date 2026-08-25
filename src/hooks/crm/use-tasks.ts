"use client";

import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/crm-tasks/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import { writeTaskToCache, removeTaskFromLists } from "@/lib/crm/task-cache";
import type { ApiTask, CreateTaskInput, UpdateTaskInput, TaskFilters } from "@/types/api/crm-tasks";

/* ---------- Queries ---------- */

export function useTasks(filters: TaskFilters) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.tasks(filters), activeCompanyId],
    queryFn: () => tasksApi.list(filters),
    enabled: Boolean(activeCompanyId) && can("crm.tasks.read"),
    placeholderData: (prev) => prev,
  });
}

export function useTask(id: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.task(id), activeCompanyId],
    queryFn: () => tasksApi.get(id),
    enabled: Boolean(activeCompanyId) && Boolean(id) && can("crm.tasks.read"),
  });
}

/* ---------- Mutations ---------- */

/**
 * Escreve a tarefa retornada pelo backend no detalhe e nas listas em cache.
 * Escopo mínimo: nada fora de `crm/task*` é tocado (deals, pipelines e o
 * restante do CRM permanecem intactos).
 */
function applyTask(qc: QueryClient, task: ApiTask) {
  writeTaskToCache(qc, task);
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskInput) => tasksApi.create(body),
    // criar altera a composição das listas → invalida só as listas de tarefas
    onSuccess: () => qc.invalidateQueries({ queryKey: crmInvalidation.allTasks }),
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTaskInput) => tasksApi.update(id, body),
    onSuccess: (task) => {
      applyTask(qc, task);
      // filtros podem deixar de casar (status/prioridade/prazo mudaram)
      qc.invalidateQueries({ queryKey: crmInvalidation.allTasks });
    },
  });
}

/** Atribuir/reatribuir: atualiza apenas a tarefa afetada nas listas e detalhe. */
export function useAssignTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedToUserId: string) => tasksApi.assign(id, assignedToUserId),
    onSuccess: (task) => applyTask(qc, task),
  });
}

/** Concluir: sem corpo; o backend devolve status/completedAt/completedByUserId. */
export function useCompleteTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tasksApi.complete(id),
    onSuccess: (task) => {
      applyTask(qc, task);
      qc.invalidateQueries({ queryKey: crmInvalidation.allTasks });
    },
  });
}

export function useReopenTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => tasksApi.reopen(id),
    onSuccess: (task) => {
      applyTask(qc, task);
      qc.invalidateQueries({ queryKey: crmInvalidation.allTasks });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: (_result, id) => {
      removeTaskFromLists(qc, id);
      qc.removeQueries({ queryKey: crmInvalidation.task(id) });
      qc.invalidateQueries({ queryKey: crmInvalidation.allTasks });
    },
  });
}
