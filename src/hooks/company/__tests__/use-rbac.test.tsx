import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

const api = vi.hoisted(() => ({
  listRoles: vi.fn(),
  permissionCatalog: vi.fn(),
}));
vi.mock("@/lib/api/company/client", () => ({ companyApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((p: string) => p.length > 0),
  activeCompanyId: "co-1",
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import { useRoles, usePermissionCatalog } from "@/hooks/company/use-rbac";

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

const deny = (perm: string) => session.can.mockImplementation((p: string) => p !== perm);

describe("permissões (a UI não depende de receber 403)", () => {
  it("papéis e catálogo NÃO buscam sem company.roles.read", () => {
    deny("company.roles.read");
    renderHook(() => useRoles(), { wrapper });
    renderHook(() => usePermissionCatalog(), { wrapper });
    expect(api.listRoles).not.toHaveBeenCalled();
    expect(api.permissionCatalog).not.toHaveBeenCalled();
  });

  it("não buscam sem empresa ativa (isolamento multiempresa)", () => {
    session.activeCompanyId = "";
    renderHook(() => useRoles(), { wrapper });
    expect(api.listRoles).not.toHaveBeenCalled();
  });

  it("com permissão e empresa, buscam e cacheiam por empresa", async () => {
    api.listRoles.mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData([...queryKeys.company.roles(), "co-1"])).toBeDefined();
  });
});

describe("hooks são somente leitura", () => {
  it("useRoles e usePermissionCatalog não expõem mutação", () => {
    api.listRoles.mockResolvedValue({ items: [] });
    api.permissionCatalog.mockResolvedValue({ groups: [], total: 0 });
    const roles = renderHook(() => useRoles(), { wrapper });
    const catalog = renderHook(() => usePermissionCatalog(), { wrapper });
    expect(roles.result.current).not.toHaveProperty("mutate");
    expect(catalog.result.current).not.toHaveProperty("mutate");
  });

  it("as chaves de RBAC não colidem com outros domínios", () => {
    expect(queryKeys.company.roles()).toEqual(["company", "roles"]);
    expect(queryKeys.company.permissionCatalog()).toEqual(["company", "permission-catalog"]);
    expect(queryKeys.company.roles()[0]).toBe("company");
    expect(queryKeys.company.roles()[0]).not.toBe("crm");
    expect(queryKeys.company.roles()[0]).not.toBe("integrations");
  });
});
