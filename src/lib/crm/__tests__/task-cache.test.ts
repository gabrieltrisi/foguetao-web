import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  replaceTaskInPage,
  removeTaskFromPage,
  writeTaskToCache,
  removeTaskFromLists,
} from "@/lib/crm/task-cache";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import type { Paginated } from "@/types/api/crm";
import type { ApiTask } from "@/types/api/crm-tasks";

function task(id: string, over: Partial<ApiTask> = {}): ApiTask {
  return {
    id,
    title: `Tarefa ${id}`,
    description: null,
    status: "PENDING",
    priority: "MEDIUM",
    assignedToUserId: "u1",
    dealId: null,
    contactId: null,
    organizationId: null,
    dueAt: null,
    reminderAt: null,
    completedAt: null,
    completedByUserId: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

function page(items: ApiTask[], total = items.length): Paginated<ApiTask> {
  return { items, total, page: 1, limit: 20, totalPages: 1 };
}

describe("replaceTaskInPage", () => {
  it("substitui a tarefa mantendo a ordem", () => {
    const p = page([task("a"), task("b"), task("c")]);
    const next = replaceTaskInPage(p, task("b", { title: "Novo título" }));
    expect(next.items.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(next.items[1].title).toBe("Novo título");
  });

  it("INVARIANTE: página sem a tarefa devolve a MESMA referência", () => {
    const p = page([task("a")]);
    expect(replaceTaskInPage(p, task("zz"))).toBe(p);
  });

  it("preserva a referência dos itens não afetados", () => {
    const a = task("a");
    const p = page([a, task("b")]);
    const next = replaceTaskInPage(p, task("b", { title: "x" }));
    expect(next.items[0]).toBe(a);
    expect(next).not.toBe(p);
  });

  it("não altera o total (substituir não muda a composição)", () => {
    const p = page([task("a"), task("b")], 42);
    expect(replaceTaskInPage(p, task("a", { status: "IN_PROGRESS" })).total).toBe(42);
  });
});

describe("removeTaskFromPage", () => {
  it("remove e decrementa o total", () => {
    const p = page([task("a"), task("b")], 10);
    const next = removeTaskFromPage(p, "a");
    expect(next.items.map((t) => t.id)).toEqual(["b"]);
    expect(next.total).toBe(9);
  });

  it("INVARIANTE: página sem a tarefa devolve a MESMA referência", () => {
    const p = page([task("a")]);
    expect(removeTaskFromPage(p, "zz")).toBe(p);
  });

  it("total nunca fica negativo", () => {
    const p = page([task("a")], 0);
    expect(removeTaskFromPage(p, "a").total).toBe(0);
  });
});

describe("writeTaskToCache (escopo mínimo)", () => {
  it("atualiza detalhe e todas as listas de tarefas em cache", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.crm.tasks({ page: 1 }), page([task("a")]));
    qc.setQueryData(queryKeys.crm.tasks({ status: "PENDING" }), page([task("a"), task("b")]));
    qc.setQueryData(queryKeys.crm.task("a"), task("a"));

    writeTaskToCache(qc, task("a", { status: "IN_PROGRESS" }));

    expect(qc.getQueryData(queryKeys.crm.task("a"))).toMatchObject({ status: "IN_PROGRESS" });
    const l1 = qc.getQueryData<Paginated<ApiTask>>(queryKeys.crm.tasks({ page: 1 }));
    const l2 = qc.getQueryData<Paginated<ApiTask>>(queryKeys.crm.tasks({ status: "PENDING" }));
    expect(l1?.items[0].status).toBe("IN_PROGRESS");
    expect(l2?.items[0].status).toBe("IN_PROGRESS");
    expect(l2?.items[1].status).toBe("PENDING");
  });

  it("acerta o detalhe na chave real dos hooks (sufixada pela empresa ativa)", () => {
    const qc = new QueryClient();
    const detailKey = [...queryKeys.crm.task("a"), "co-1"];
    qc.setQueryData(detailKey, task("a"));

    writeTaskToCache(qc, task("a", { status: "COMPLETED" }));

    expect(qc.getQueryData(detailKey)).toMatchObject({ status: "COMPLETED" });
  });

  it("NÃO toca caches de deals/pipelines", () => {
    const qc = new QueryClient();
    const board = { columns: [] };
    qc.setQueryData(queryKeys.crm.deals({}), board);
    qc.setQueryData(queryKeys.crm.pipelines({}), board);

    writeTaskToCache(qc, task("a"));

    expect(qc.getQueryData(queryKeys.crm.deals({}))).toBe(board);
    expect(qc.getQueryData(queryKeys.crm.pipelines({}))).toBe(board);
  });

  it("INVARIANTE: lista que não contém a tarefa mantém a referência", () => {
    const qc = new QueryClient();
    const other = page([task("z")]);
    qc.setQueryData(queryKeys.crm.tasks({ page: 2 }), other);

    writeTaskToCache(qc, task("a"));

    expect(qc.getQueryData(queryKeys.crm.tasks({ page: 2 }))).toBe(other);
  });
});

describe("removeTaskFromLists", () => {
  it("remove de todas as listas em cache", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.crm.tasks({ page: 1 }), page([task("a"), task("b")], 2));
    qc.setQueryData(queryKeys.crm.tasks({ overdue: true }), page([task("a")], 1));

    removeTaskFromLists(qc, "a");

    expect(qc.getQueryData<Paginated<ApiTask>>(queryKeys.crm.tasks({ page: 1 }))?.items.map((t) => t.id)).toEqual(["b"]);
    expect(qc.getQueryData<Paginated<ApiTask>>(queryKeys.crm.tasks({ overdue: true }))?.items).toEqual([]);
  });
});

describe("query keys (centralizadas, sem chave inline)", () => {
  it("lista e detalhe são estáveis e escopados", () => {
    expect(queryKeys.crm.tasks({ page: 1 })).toEqual(["crm", "tasks", { page: 1 }]);
    expect(queryKeys.crm.task("a")).toEqual(["crm", "task", "a"]);
  });

  it("filtros diferentes → chaves diferentes", () => {
    expect(queryKeys.crm.tasks({ page: 1 })).not.toEqual(queryKeys.crm.tasks({ page: 2 }));
  });

  it("allTasks é prefixo de qualquer lista de tarefas, e só dela", () => {
    const key = queryKeys.crm.tasks({ status: "PENDING" });
    expect(key.slice(0, 2)).toEqual([...crmInvalidation.allTasks]);
    expect(queryKeys.crm.deals({}).slice(0, 2)).not.toEqual([...crmInvalidation.allTasks]);
    expect(queryKeys.crm.task("a").slice(0, 2)).not.toEqual([...crmInvalidation.allTasks]);
  });
});
