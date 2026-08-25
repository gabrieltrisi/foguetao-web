import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
}));
vi.mock("@/lib/api/company/client", () => ({ companyApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1",
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import { useCompany, useUpdateCompany } from "@/hooks/company/use-company";

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

function spyInvalidate() {
  const calls: unknown[][] = [];
  vi.spyOn(qc, "invalidateQueries").mockImplementation((filters?: { queryKey?: unknown }) => {
    calls.push((filters?.queryKey as unknown[]) ?? []);
    return Promise.resolve();
  });
  return calls;
}

describe("useCompany (permissões)", () => {
  it("não busca sem company.read", () => {
    session.can.mockImplementation((p: string) => p !== "company.read");
    renderHook(() => useCompany(), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("não busca sem empresa ativa (isolamento multiempresa)", () => {
    session.activeCompanyId = "";
    renderHook(() => useCompany(), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("com permissão e empresa, busca e cacheia por empresa", async () => {
    api.get.mockResolvedValue({ id: "co-1", name: "Empresa" });
    const { result } = renderHook(() => useCompany(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData([...queryKeys.company.current(), "co-1"])).toBeDefined();
  });
});

describe("useUpdateCompany", () => {
  it("repassa o corpo e invalida empresa + sessão", async () => {
    const calls = spyInvalidate();
    api.update.mockResolvedValue({ id: "co-1", name: "Novo" });

    const { result } = renderHook(() => useUpdateCompany(), { wrapper });
    await result.current.mutateAsync({ name: "Novo" });

    expect(api.update).toHaveBeenCalledWith({ name: "Novo" });
    // a sessão carrega nome/status/plano no seletor de empresas
    expect(calls).toContainEqual(["company", "current"]);
    expect(calls).toContainEqual(["session"]);
  });

  it("erro do backend não invalida nada", async () => {
    const calls = spyInvalidate();
    api.update.mockRejectedValue(new Error("403"));

    const { result } = renderHook(() => useUpdateCompany(), { wrapper });
    await expect(result.current.mutateAsync({ name: "X" })).rejects.toThrow();

    expect(calls).toEqual([]);
  });

  it("NÃO invalida CRM, integrações, membros nem convites", async () => {
    const calls = spyInvalidate();
    api.update.mockResolvedValue({ id: "co-1" });

    const { result } = renderHook(() => useUpdateCompany(), { wrapper });
    await result.current.mutateAsync({ timezone: "Europe/Lisbon" });

    expect(calls.length).toBeGreaterThan(0);
    for (const key of calls) {
      expect(["company", "session"]).toContain(key[0]);
      // escopo: nunca a lista de membros/convites
      expect(key).not.toEqual(["company", "members"]);
      expect(key).not.toEqual(["company", "invitations"]);
    }
  });
});
