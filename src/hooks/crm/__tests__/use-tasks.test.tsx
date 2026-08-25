import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { Paginated } from "@/types/api/crm";
import type { ApiTask } from "@/types/api/crm-tasks";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  assign: vi.fn(),
  complete: vi.fn(),
  reopen: vi.fn(),
}));
vi.mock("@/lib/api/crm-tasks/client", () => ({ tasksApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1",
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import {
  useTasks,
  useTask,
  useAssignTask,
  useCompleteTask,
  useReopenTask,
  useDeleteTask,
  useCreateTask,
  useUpdateTask,
} from "@/hooks/crm/use-tasks";

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

let qc: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.can.mockReturnValue(true);
  session.activeCompanyId = "co-1";
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

/** Chave real usada pelos hooks (inclui a empresa ativa). */
const listKey = (filters: unknown) => [...queryKeys.crm.tasks(filters), "co-1"];

describe("permissões (a UI não depende de receber 403)", () => {
  it("useTasks não busca sem crm.tasks.read", () => {
    session.can.mockImplementation((p: string) => p !== "crm.tasks.read");
    renderHook(() => useTasks({ page: 1 }), { wrapper });
    expect(api.list).not.toHaveBeenCalled();
  });

  it("useTask não busca sem crm.tasks.read", () => {
    session.can.mockImplementation((p: string) => p !== "crm.tasks.read");
    renderHook(() => useTask("t1"), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("useTasks não busca sem empresa ativa", () => {
    session.activeCompanyId = "";
    renderHook(() => useTasks({ page: 1 }), { wrapper });
    expect(api.list).not.toHaveBeenCalled();
  });

  it("com permissão e empresa, busca com os filtros informados", async () => {
    api.list.mockResolvedValue(page([task("a")]));
    const { result } = renderHook(() => useTasks({ page: 1, overdue: true }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.list).toHaveBeenCalledWith({ page: 1, overdue: true });
  });
});

describe("useAssignTask", () => {
  it("envia apenas assignedToUserId e escreve a tarefa do backend no cache", async () => {
    qc.setQueryData(listKey({ page: 1 }), page([task("t1"), task("t2")]));
    api.assign.mockResolvedValue(task("t1", { assignedToUserId: "u9" }));

    const { result } = renderHook(() => useAssignTask("t1"), { wrapper });
    await result.current.mutateAsync("u9");

    expect(api.assign).toHaveBeenCalledWith("t1", "u9");
    const list = qc.getQueryData<Paginated<ApiTask>>(listKey({ page: 1 }));
    expect(list?.items[0].assignedToUserId).toBe("u9");
    expect(list?.items[1].assignedToUserId).toBe("u1");
  });

  it("não invalida as listas (atribuir não muda a composição)", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.assign.mockResolvedValue(task("t1", { assignedToUserId: "u9" }));
    const { result } = renderHook(() => useAssignTask("t1"), { wrapper });
    await result.current.mutateAsync("u9");
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useCompleteTask / useReopenTask", () => {
  it("complete não envia corpo e aplica o estado autoritativo do backend", async () => {
    qc.setQueryData(listKey({ page: 1 }), page([task("t1")]));
    api.complete.mockResolvedValue(
      task("t1", { status: "COMPLETED", completedAt: "2026-07-14T12:00:00.000Z", completedByUserId: "u1" }),
    );

    const { result } = renderHook(() => useCompleteTask("t1"), { wrapper });
    await result.current.mutateAsync(undefined);

    expect(api.complete).toHaveBeenCalledWith("t1");
    expect(qc.getQueryData<Paginated<ApiTask>>(listKey({ page: 1 }))?.items[0]).toMatchObject({
      status: "COMPLETED",
      completedAt: "2026-07-14T12:00:00.000Z",
    });
  });

  it("reopen não envia corpo e volta o status vindo do backend", async () => {
    qc.setQueryData(listKey({ page: 1 }), page([task("t1", { status: "COMPLETED" })]));
    api.reopen.mockResolvedValue(task("t1", { status: "PENDING", completedAt: null }));

    const { result } = renderHook(() => useReopenTask("t1"), { wrapper });
    await result.current.mutateAsync(undefined);

    expect(api.reopen).toHaveBeenCalledWith("t1");
    expect(qc.getQueryData<Paginated<ApiTask>>(listKey({ page: 1 }))?.items[0].status).toBe("PENDING");
  });

  it("erro do backend não altera o cache", async () => {
    const before = page([task("t1")]);
    qc.setQueryData(listKey({ page: 1 }), before);
    api.complete.mockRejectedValue(new Error("409"));

    const { result } = renderHook(() => useCompleteTask("t1"), { wrapper });
    await expect(result.current.mutateAsync(undefined)).rejects.toThrow();

    expect(qc.getQueryData(listKey({ page: 1 }))).toBe(before);
  });
});

describe("useDeleteTask", () => {
  it("remove das listas e descarta o detalhe", async () => {
    qc.setQueryData(listKey({ page: 1 }), page([task("t1"), task("t2")], 2));
    qc.setQueryData([...queryKeys.crm.task("t1"), "co-1"], task("t1"));
    api.remove.mockResolvedValue({ message: "Tarefa excluída" });

    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    await result.current.mutateAsync("t1");

    const list = qc.getQueryData<Paginated<ApiTask>>(listKey({ page: 1 }));
    expect(list?.items.map((t) => t.id)).toEqual(["t2"]);
    expect(list?.total).toBe(1);
    expect(qc.getQueryData([...queryKeys.crm.task("t1"), "co-1"])).toBeUndefined();
  });
});

describe("useCreateTask / useUpdateTask (payload)", () => {
  it("create repassa o corpo com assignedToUserId obrigatório", async () => {
    api.create.mockResolvedValue(task("novo"));
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await result.current.mutateAsync({ title: "Ligar", assignedToUserId: "u1", priority: "HIGH" });
    expect(api.create).toHaveBeenCalledWith({ title: "Ligar", assignedToUserId: "u1", priority: "HIGH" });
  });

  it("update aplica a tarefa devolvida no detalhe e nas listas", async () => {
    qc.setQueryData(listKey({ page: 1 }), page([task("t1")]));
    qc.setQueryData([...queryKeys.crm.task("t1"), "co-1"], task("t1"));
    api.update.mockResolvedValue(task("t1", { title: "Novo", priority: "URGENT" }));

    const { result } = renderHook(() => useUpdateTask("t1"), { wrapper });
    await result.current.mutateAsync({ title: "Novo", priority: "URGENT" });

    expect(api.update).toHaveBeenCalledWith("t1", { title: "Novo", priority: "URGENT" });
    expect(qc.getQueryData<Paginated<ApiTask>>(listKey({ page: 1 }))?.items[0].title).toBe("Novo");
    expect(qc.getQueryData([...queryKeys.crm.task("t1"), "co-1"])).toMatchObject({ title: "Novo" });
  });

  it("update aceita null para limpar campos opcionais", async () => {
    api.update.mockResolvedValue(task("t1", { dueAt: null }));
    const { result } = renderHook(() => useUpdateTask("t1"), { wrapper });
    await result.current.mutateAsync({ dueAt: null, dealId: null });
    expect(api.update).toHaveBeenCalledWith("t1", { dueAt: null, dealId: null });
  });
});
