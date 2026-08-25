import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { ApiCampaign, ApiCampaignList } from "@/types/api/marketing";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  action: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/lib/api/marketing/client", () => ({ campaignsApi: api }));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1" as string | null,
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import {
  useCampaigns,
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useCampaignAction,
  useDeleteCampaign,
} from "@/hooks/marketing/use-campaigns";

function campaign(id: string, over: Partial<ApiCampaign> = {}): ApiCampaign {
  return {
    id,
    name: `Campanha ${id}`,
    description: null,
    status: "DRAFT",
    channel: "INTERNAL",
    objective: "LEAD_GENERATION",
    budget: null,
    currency: "BRL",
    startAt: null,
    endAt: null,
    ownerUserId: null,
    pipelineId: null,
    externalProvider: null,
    externalId: null,
    archivedAt: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

function page(items: ApiCampaign[]): ApiCampaignList {
  return { items, total: items.length, page: 1, limit: 20, totalPages: 1 };
}

let qc: QueryClient;
function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.can.mockImplementation(() => true);
  session.activeCompanyId = "co-1";
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe("useCampaigns", () => {
  it("busca com os filtros e cacheia por empresa", async () => {
    api.list.mockResolvedValue(page([campaign("c1")]));
    const filters = { page: 1, status: "ACTIVE" };
    const { result } = renderHook(() => useCampaigns(filters), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.list).toHaveBeenCalledWith(filters);
    expect(qc.getQueryData([...queryKeys.marketing.campaigns(filters), "co-1"])).toBeDefined();
  });

  it("não busca sem campaigns.read", async () => {
    session.can.mockImplementation((p: string) => p !== "campaigns.read");
    const { result } = renderHook(() => useCampaigns(), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(api.list).not.toHaveBeenCalled();
  });

  it("não busca sem empresa ativa", async () => {
    session.activeCompanyId = null;
    const { result } = renderHook(() => useCampaigns(), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(api.list).not.toHaveBeenCalled();
  });
});

describe("useCampaign", () => {
  it("não busca sem id", async () => {
    const { result } = renderHook(() => useCampaign(""), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(api.get).not.toHaveBeenCalled();
  });

  it("não busca sem campaigns.read", async () => {
    session.can.mockImplementation((p: string) => p !== "campaigns.read");
    const { result } = renderHook(() => useCampaign("c1"), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe("mutações invalidam apenas o domínio de marketing", () => {
  it("criar invalida a campanha criada e todas as listas", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.create.mockResolvedValue(campaign("c9"));
    const { result } = renderHook(() => useCreateCampaign(), { wrapper });
    await result.current.mutateAsync({ name: "Nova" });
    const keys = spy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys).toContainEqual(["marketing", "campaign", "c9"]);
    expect(keys).toContainEqual(["marketing", "campaigns"]);
    expect(keys.every((k) => k?.[0] === "marketing")).toBe(true);
  });

  it("atualizar envia o body e invalida a campanha", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.update.mockResolvedValue(campaign("c1", { name: "Novo nome" }));
    const { result } = renderHook(() => useUpdateCampaign("c1"), { wrapper });
    await result.current.mutateAsync({ name: "Novo nome", budget: "10.00" });
    expect(api.update).toHaveBeenCalledWith("c1", { name: "Novo nome", budget: "10.00" });
    expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toContainEqual([
      "marketing",
      "campaign",
      "c1",
    ]);
  });

  it("ação de status chama o endpoint da ação e invalida", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.action.mockResolvedValue(campaign("c1", { status: "ACTIVE" }));
    const { result } = renderHook(() => useCampaignAction("c1"), { wrapper });
    await result.current.mutateAsync("activate");
    expect(api.action).toHaveBeenCalledWith("c1", "activate");
    expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toContainEqual(["marketing", "campaigns"]);
  });

  it("excluir invalida as listas", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.remove.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useDeleteCampaign(), { wrapper });
    await result.current.mutateAsync("c1");
    expect(api.remove).toHaveBeenCalledWith("c1");
    expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toContainEqual(["marketing", "campaigns"]);
  });

  it("uma mutação de campanha nunca invalida CRM nem messaging", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    api.action.mockResolvedValue(campaign("c1", { status: "PAUSED" }));
    const { result } = renderHook(() => useCampaignAction("c1"), { wrapper });
    await result.current.mutateAsync("pause");
    const roots = spy.mock.calls.map((c) => c[0]?.queryKey?.[0]);
    expect(roots).not.toContain("crm");
    expect(roots).not.toContain("messaging");
  });
});
