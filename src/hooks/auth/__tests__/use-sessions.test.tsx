import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api/client", () => ({ clientFetch: fetchMock }));

import { useSessions, useRevokeSession } from "@/hooks/auth/use-sessions";

let qc: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe("useSessions", () => {
  it("busca a lista real de sessões", async () => {
    fetchMock.mockResolvedValue([{ id: "s1", current: true }]);
    const { result } = renderHook(() => useSessions(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/sessions", expect.anything());
    expect(qc.getQueryData(queryKeys.sessions)).toEqual([{ id: "s1", current: true }]);
  });
});

describe("useRevokeSession", () => {
  it("chama o DELETE da sessão e invalida a lista", async () => {
    const calls: unknown[][] = [];
    vi.spyOn(qc, "invalidateQueries").mockImplementation((f?: { queryKey?: unknown }) => {
      calls.push((f?.queryKey as unknown[]) ?? []);
      return Promise.resolve();
    });
    fetchMock.mockResolvedValue({ message: "Sessão revogada" });

    const { result } = renderHook(() => useRevokeSession(), { wrapper });
    await result.current.mutateAsync("s2");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/sessions/s2", { method: "DELETE" });
    // invalida SÓ as sessões, nada de CRM/empresa/integrações
    expect(calls).toEqual([[...queryKeys.sessions]]);
  });

  it("erro do backend não invalida nada", async () => {
    const calls: unknown[][] = [];
    vi.spyOn(qc, "invalidateQueries").mockImplementation((f?: { queryKey?: unknown }) => {
      calls.push((f?.queryKey as unknown[]) ?? []);
      return Promise.resolve();
    });
    fetchMock.mockRejectedValue(new Error("404"));

    const { result } = renderHook(() => useRevokeSession(), { wrapper });
    await expect(result.current.mutateAsync("s2")).rejects.toThrow();
    expect(calls).toEqual([]);
  });

  it("a chave de sessões não colide com CRM/empresa/integrações", async () => {
    // queryKeys.sessions vive em ["auth","sessions"] — domínio próprio.
    expect(queryKeys.sessions[0]).toBe("auth");
    expect(queryKeys.sessions[0]).not.toBe("crm");
    expect(queryKeys.sessions[0]).not.toBe("company");
    expect(queryKeys.sessions[0]).not.toBe("integrations");
  });
});
