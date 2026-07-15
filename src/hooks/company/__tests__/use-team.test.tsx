import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({
  listMembers: vi.fn(),
  getMember: vi.fn(),
  updateMember: vi.fn(),
  removeMember: vi.fn(),
  listInvitations: vi.fn(),
  createInvitation: vi.fn(),
  revokeInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
}));
vi.mock("@/lib/api/company/client", () => ({ companyApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1",
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import {
  useTeamMembers,
  useTeamMember,
  useInvitations,
  useUpdateMember,
  useRemoveMember,
  useCreateInvitation,
  useRevokeInvitation,
  useAcceptInvitation,
} from "@/hooks/company/use-team";
import { useMembers } from "@/hooks/company/use-members";

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

const denyOnly = (denied: string) => session.can.mockImplementation((p: string) => p !== denied);

function spyInvalidate() {
  const calls: unknown[][] = [];
  vi.spyOn(qc, "invalidateQueries").mockImplementation((filters?: { queryKey?: unknown }) => {
    calls.push((filters?.queryKey as unknown[]) ?? []);
    return Promise.resolve();
  });
  return calls;
}

describe("permissões (a UI não depende de receber 403)", () => {
  it("membros não buscam sem company.members.read", () => {
    denyOnly("company.members.read");
    renderHook(() => useTeamMembers(), { wrapper });
    renderHook(() => useTeamMember("m1"), { wrapper });
    renderHook(() => useMembers(), { wrapper });
    expect(api.listMembers).not.toHaveBeenCalled();
    expect(api.getMember).not.toHaveBeenCalled();
  });

  it("convites reusam company.members.read (não há permissão própria)", () => {
    denyOnly("company.members.read");
    renderHook(() => useInvitations(), { wrapper });
    expect(api.listInvitations).not.toHaveBeenCalled();

    session.can.mockImplementation(() => true);
    renderHook(() => useInvitations(), { wrapper });
    expect(api.listInvitations).toHaveBeenCalled();
  });

  it("nada busca sem empresa ativa (isolamento multiempresa)", () => {
    session.activeCompanyId = "";
    renderHook(() => useTeamMembers(), { wrapper });
    renderHook(() => useInvitations(), { wrapper });
    expect(api.listMembers).not.toHaveBeenCalled();
    expect(api.listInvitations).not.toHaveBeenCalled();
  });

  it("useMembers compartilha a chave de useTeamMembers (uma mutação atualiza os dois)", () => {
    renderHook(() => useMembers({ limit: 100 }), { wrapper });
    renderHook(() => useTeamMembers({ limit: 100 }), { wrapper });
    // mesma queryKey → o React Query dedupa numa única requisição
    expect(api.listMembers).toHaveBeenCalledTimes(1);
  });
});

describe("invalidações escopadas", () => {
  it("alterar papel/status invalida o membro afetado e a lista", async () => {
    const calls = spyInvalidate();
    api.updateMember.mockResolvedValue({ id: "m1" });
    const { result } = renderHook(() => useUpdateMember("m1"), { wrapper });
    await result.current.mutateAsync({ role: "MANAGER" });

    expect(calls).toContainEqual(["company", "members"]);
    expect(calls).toContainEqual(["company", "member", "m1"]);
  });

  it("remover membro descarta o detalhe e invalida a lista", async () => {
    const removed: unknown[][] = [];
    vi.spyOn(qc, "removeQueries").mockImplementation((filters?: { queryKey?: unknown }) => {
      removed.push((filters?.queryKey as unknown[]) ?? []);
    });
    const calls = spyInvalidate();
    api.removeMember.mockResolvedValue({ message: "Membro removido" });

    const { result } = renderHook(() => useRemoveMember(), { wrapper });
    await result.current.mutateAsync("m1");

    expect(removed).toContainEqual(["company", "member", "m1"]);
    expect(calls).toContainEqual(["company", "members"]);
  });

  it("criar convite invalida SÓ os convites (o convidado ainda não é membro)", async () => {
    const calls = spyInvalidate();
    api.createInvitation.mockResolvedValue({ invitation: { id: "i1" } });
    const { result } = renderHook(() => useCreateInvitation(), { wrapper });
    await result.current.mutateAsync({ email: "a@b.com", role: "VIEWER" });

    expect(calls).toEqual([["company", "invitations"]]);
  });

  it("revogar convite invalida só os convites", async () => {
    const calls = spyInvalidate();
    api.revokeInvitation.mockResolvedValue({ message: "Convite revogado" });
    const { result } = renderHook(() => useRevokeInvitation(), { wrapper });
    await result.current.mutateAsync("i1");

    expect(calls).toEqual([["company", "invitations"]]);
  });

  it("aceitar convite invalida a SESSÃO (o acesso do usuário mudou)", async () => {
    const calls = spyInvalidate();
    api.acceptInvitation.mockResolvedValue({ company: { id: "co-2" }, role: "MANAGER" });
    const { result } = renderHook(() => useAcceptInvitation(), { wrapper });
    await result.current.mutateAsync("a".repeat(64));

    expect(calls).toContainEqual(["session"]);
    expect(calls).toContainEqual(["company", "members"]);
  });

  it("erro do backend não invalida nada", async () => {
    const calls = spyInvalidate();
    api.updateMember.mockRejectedValue(new Error("403"));
    const { result } = renderHook(() => useUpdateMember("m1"), { wrapper });
    await expect(result.current.mutateAsync({ role: "OWNER" })).rejects.toThrow();

    expect(calls).toEqual([]);
  });

  it("NENHUMA mutação de equipe toca CRM ou integrações", async () => {
    const calls = spyInvalidate();
    api.updateMember.mockResolvedValue({ id: "m1" });
    api.removeMember.mockResolvedValue({ message: "ok" });
    api.createInvitation.mockResolvedValue({ invitation: { id: "i1" } });
    api.revokeInvitation.mockResolvedValue({ message: "ok" });

    await renderHook(() => useUpdateMember("m1"), { wrapper }).result.current.mutateAsync({
      role: "VIEWER",
    });
    await renderHook(() => useRemoveMember(), { wrapper }).result.current.mutateAsync("m1");
    await renderHook(() => useCreateInvitation(), { wrapper }).result.current.mutateAsync({
      email: "a@b.com",
      role: "VIEWER",
    });
    await renderHook(() => useRevokeInvitation(), { wrapper }).result.current.mutateAsync("i1");

    expect(calls.length).toBeGreaterThan(0);
    for (const key of calls) {
      expect(["company", "session"]).toContain(key[0]);
      expect(key[0]).not.toBe("crm");
      expect(key[0]).not.toBe("integrations");
    }
  });
});
