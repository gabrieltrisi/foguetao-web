import type { QueryClient } from "@tanstack/react-query";
import { crmInvalidation } from "@/lib/query/keys";
import type { Paginated } from "@/types/api/crm";
import type { ApiTask } from "@/types/api/crm-tasks";

/**
 * Transformações puras das páginas de tarefas em cache.
 *
 * Invariante de performance: quando a tarefa não está na página, a MESMA
 * referência é devolvida — o React Query não notifica observers à toa.
 */

/** Substitui a tarefa numa página (mantendo a ordem). No-op se não estiver lá. */
export function replaceTaskInPage(
  page: Paginated<ApiTask>,
  task: ApiTask,
): Paginated<ApiTask> {
  if (!page.items.some((t) => t.id === task.id)) return page;
  return { ...page, items: page.items.map((t) => (t.id === task.id ? task : t)) };
}

/** Remove a tarefa de uma página e ajusta o total. No-op se não estiver lá. */
export function removeTaskFromPage(page: Paginated<ApiTask>, taskId: string): Paginated<ApiTask> {
  if (!page.items.some((t) => t.id === taskId)) return page;
  return {
    ...page,
    items: page.items.filter((t) => t.id !== taskId),
    total: Math.max(0, page.total - 1),
  };
}

/**
 * Aplica a tarefa autoritativa do backend no detalhe e em todas as listas de
 * tarefas em cache. Escopo: apenas `crm/task` e `crm/tasks`.
 *
 * Usa `setQueriesData` (prefixo) também no detalhe: as chaves reais dos hooks
 * terminam com a empresa ativa (`["crm","task",id,companyId]`), então um
 * `setQueryData` com chave exata não acertaria nada.
 */
export function writeTaskToCache(qc: QueryClient, task: ApiTask): void {
  qc.setQueriesData<ApiTask>({ queryKey: crmInvalidation.task(task.id) }, () => task);
  qc.setQueriesData<Paginated<ApiTask>>({ queryKey: crmInvalidation.allTasks }, (page) =>
    page ? replaceTaskInPage(page, task) : page,
  );
}

/** Remove a tarefa de todas as listas em cache (após exclusão). */
export function removeTaskFromLists(qc: QueryClient, taskId: string): void {
  qc.setQueriesData<Paginated<ApiTask>>({ queryKey: crmInvalidation.allTasks }, (page) =>
    page ? removeTaskFromPage(page, taskId) : page,
  );
}
