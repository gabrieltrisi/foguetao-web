import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const api = vi.hoisted(() => ({
  catalog: vi.fn(),
  catalogItem: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  test: vi.fn(),
  logs: vi.fn(),
}));
vi.mock("@/lib/api/integrations/client", () => ({ integrationsApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1",
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import {
  useIntegrationCatalog,
  useConnections,
  useConnection,
  useConnectionLogs,
  useCreateConnection,
  useConnectConnection,
  useDisconnectConnection,
  useTestConnection,
  useDeleteConnection,
} from "@/hooks/integrations/use-integrations";

let qc: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.can.mockImplementation((p: string) => p.length > 0);
  session.activeCompanyId = "co-1";
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

const denyOnly = (denied: string) =>
  session.can.mockImplementation((p: string) => p !== denied);

describe("permissões (a UI não depende de receber 403)", () => {
  it("catálogo não busca sem integrations.connections.read", () => {
    denyOnly("integrations.connections.read");
    renderHook(() => useIntegrationCatalog(), { wrapper });
    expect(api.catalog).not.toHaveBeenCalled();
  });

  it("conexões não buscam sem integrations.connections.read", () => {
    denyOnly("integrations.connections.read");
    renderHook(() => useConnections(), { wrapper });
    renderHook(() => useConnection("c1"), { wrapper });
    expect(api.list).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("logs exigem integrations.logs.read, permissão distinta da de leitura", () => {
    denyOnly("integrations.logs.read");
    renderHook(() => useConnectionLogs("c1"), { wrapper });
    expect(api.logs).not.toHaveBeenCalled();

    session.can.mockImplementation(() => true);
    renderHook(() => useConnectionLogs("c1"), { wrapper });
    expect(api.logs).toHaveBeenCalled();
  });

  it("nada busca sem empresa ativa (isolamento multiempresa)", () => {
    session.activeCompanyId = "";
    renderHook(() => useIntegrationCatalog(), { wrapper });
    renderHook(() => useConnections(), { wrapper });
    expect(api.catalog).not.toHaveBeenCalled();
    expect(api.list).not.toHaveBeenCalled();
  });

  it("logs não buscam quando desabilitados explicitamente (aba fechada)", () => {
    renderHook(() => useConnectionLogs("c1", undefined, false), { wrapper });
    expect(api.logs).not.toHaveBeenCalled();
  });
});

describe("chaves incluem a empresa ativa", () => {
  it("catálogo e conexões são cacheados por empresa", async () => {
    api.catalog.mockResolvedValue({ items: [], enabled: true, mode: "mock" });
    const { result } = renderHook(() => useIntegrationCatalog(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData([...queryKeys.integrations.catalog({}), "co-1"])).toBeDefined();
  });
});

describe("invalidações escopadas", () => {
  /** Captura os prefixos invalidados para provar que o CRM não é tocado. */
  function spyInvalidate() {
    const calls: unknown[][] = [];
    vi.spyOn(qc, "invalidateQueries").mockImplementation((filters?: { queryKey?: unknown }) => {
      calls.push((filters?.queryKey as unknown[]) ?? []);
      return Promise.resolve();
    });
    return calls;
  }

  it("criar invalida apenas a lista de conexões", async () => {
    const calls = spyInvalidate();
    api.create.mockResolvedValue({ id: "c1" });
    const { result } = renderHook(() => useCreateConnection(), { wrapper });
    await result.current.mutateAsync({ provider: "MOCK", category: "CUSTOM", name: "x" });

    expect(calls).toEqual([["integrations", "connections"]]);
  });

  it("ativar/pausar atualizam a conexão afetada e a lista", async () => {
    const calls = spyInvalidate();
    api.connect.mockResolvedValue({ success: true, status: "CONNECTED" });
    const { result } = renderHook(() => useConnectConnection("c1"), { wrapper });
    await result.current.mutateAsync();

    expect(calls).toContainEqual(["integrations", "connection", "c1"]);
    expect(calls).toContainEqual(["integrations", "connections"]);
  });

  it("pausar usa disconnect (o backend não tem PAUSED)", async () => {
    api.disconnect.mockResolvedValue({ success: true, status: "DISCONNECTED" });
    const { result } = renderHook(() => useDisconnectConnection("c1"), { wrapper });
    await result.current.mutateAsync();
    expect(api.disconnect).toHaveBeenCalledWith("c1");
  });

  it("testar invalida logs e detalhe", async () => {
    const calls = spyInvalidate();
    api.test.mockResolvedValue({ success: true, externalAccountId: null, externalAccountName: null });
    const { result } = renderHook(() => useTestConnection("c1"), { wrapper });
    await result.current.mutateAsync();

    expect(calls).toContainEqual(["integrations", "connection", "c1", "logs"]);
    expect(calls).toContainEqual(["integrations", "connection", "c1"]);
  });

  it("teste que FALHA também invalida os logs (a falha vira log)", async () => {
    const calls = spyInvalidate();
    api.test.mockRejectedValue(new Error("falhou"));
    const { result } = renderHook(() => useTestConnection("c1"), { wrapper });
    await expect(result.current.mutateAsync()).rejects.toThrow();

    expect(calls).toContainEqual(["integrations", "connection", "c1", "logs"]);
  });

  it("excluir remove o detalhe e invalida a lista", async () => {
    const removed: unknown[][] = [];
    vi.spyOn(qc, "removeQueries").mockImplementation((filters?: { queryKey?: unknown }) => {
      removed.push((filters?.queryKey as unknown[]) ?? []);
    });
    const calls = spyInvalidate();
    api.remove.mockResolvedValue({ message: "Conexão excluída" });

    const { result } = renderHook(() => useDeleteConnection(), { wrapper });
    await result.current.mutateAsync("c1");

    expect(removed).toContainEqual(["integrations", "connection", "c1"]);
    expect(calls).toContainEqual(["integrations", "connections"]);
  });

  it("NENHUMA mutação de integração invalida CRM, deals, kanban ou tarefas", async () => {
    const calls = spyInvalidate();
    api.create.mockResolvedValue({ id: "c1" });
    api.connect.mockResolvedValue({ success: true, status: "CONNECTED" });
    api.test.mockResolvedValue({ success: true, externalAccountId: null, externalAccountName: null });
    api.remove.mockResolvedValue({ message: "ok" });

    await renderHook(() => useCreateConnection(), { wrapper }).result.current.mutateAsync({
      provider: "MOCK",
      category: "CUSTOM",
      name: "x",
    });
    await renderHook(() => useConnectConnection("c1"), { wrapper }).result.current.mutateAsync();
    await renderHook(() => useTestConnection("c1"), { wrapper }).result.current.mutateAsync();
    await renderHook(() => useDeleteConnection(), { wrapper }).result.current.mutateAsync("c1");

    // Toda invalidação é escopada em `integrations`. Nenhuma é ampla (vazia).
    expect(calls.length).toBeGreaterThan(0);
    for (const key of calls) {
      expect(key[0]).toBe("integrations");
      expect(key.length).toBeGreaterThan(0);
    }
  });
});
