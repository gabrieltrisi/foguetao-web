import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { ApiAttribution, ApiContactAttributions, ApiLeadSource } from "@/types/api/marketing";

const attributionMock = vi.hoisted(() => ({
  listByContact: vi.fn(),
  listByCampaign: vi.fn(),
  create: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
const leadSourcesMock = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  setup: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/lib/api/marketing/client", () => ({
  attributionApi: attributionMock,
  leadSourcesApi: leadSourcesMock,
}));

const session = vi.hoisted(() => ({
  can: vi.fn((permission: string) => permission.length > 0),
  activeCompanyId: "co-1" as string | null,
}));
vi.mock("@/providers/session-provider", () => ({ useSession: () => session }));

import {
  useContactAttributions,
  useCampaignAttributions,
  useCreateAttribution,
  useDeleteAttribution,
  useUpdateAttribution,
} from "@/hooks/marketing/use-attribution";
import {
  useActiveLeadSources,
  useCreateLeadSource,
  useDeleteLeadSource,
  useLeadSources,
  useSetupLeadSources,
} from "@/hooks/marketing/use-lead-sources";

function leadSource(id = "s1"): ApiLeadSource {
  return {
    id,
    name: "Indicação",
    kind: "REFERRAL",
    description: null,
    active: true,
    position: 0,
    system: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  };
}

function attribution(id = "a1"): ApiAttribution {
  return {
    id,
    contactId: "c1",
    leadSource: leadSource(),
    campaign: null,
    medium: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    referrerUrl: null,
    landingUrl: null,
    externalClickId: null,
    touchpointOrigin: "MANUAL",
    capturedAt: "2026-08-01T10:00:00.000Z",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  };
}

function history(items: ApiAttribution[]): ApiContactAttributions {
  return {
    items,
    firstTouch: items[items.length - 1] ?? null,
    lastTouch: items[0] ?? null,
    total: items.length,
  };
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

describe("useLeadSources", () => {
  it("busca o catálogo e cacheia por empresa", async () => {
    leadSourcesMock.list.mockResolvedValue({ items: [leadSource()] });
    const { result } = renderHook(() => useLeadSources(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData([...queryKeys.marketing.leadSources(undefined), "co-1"])).toBeDefined();
  });

  it("useActiveLeadSources pede só as ativas — o backend recusa origem inativa", async () => {
    leadSourcesMock.list.mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useActiveLeadSources(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(leadSourcesMock.list).toHaveBeenCalledWith({ active: true });
  });

  it("não busca sem marketing.lead_sources.read", async () => {
    session.can.mockImplementation((p: string) => p !== "marketing.lead_sources.read");
    const { result } = renderHook(() => useLeadSources(), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(leadSourcesMock.list).not.toHaveBeenCalled();
  });
});

describe("useContactAttributions", () => {
  it("busca o histórico do contato", async () => {
    attributionMock.listByContact.mockResolvedValue(history([attribution()]));
    const { result } = renderHook(() => useContactAttributions("c1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(attributionMock.listByContact).toHaveBeenCalledWith("c1");
    // firstTouch/lastTouch vêm do backend — o hook não recalcula
    expect(result.current.data?.firstTouch).toBeDefined();
  });

  it("não busca sem marketing.attribution.read", async () => {
    session.can.mockImplementation((p: string) => p !== "marketing.attribution.read");
    const { result } = renderHook(() => useContactAttributions("c1"), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(attributionMock.listByContact).not.toHaveBeenCalled();
  });

  it("não busca sem id nem sem empresa", async () => {
    const noId = renderHook(() => useContactAttributions(""), { wrapper });
    await waitFor(() => expect(noId.result.current.fetchStatus).toBe("idle"));
    session.activeCompanyId = null;
    const noCompany = renderHook(() => useContactAttributions("c1"), { wrapper });
    await waitFor(() => expect(noCompany.result.current.fetchStatus).toBe("idle"));
    expect(attributionMock.listByContact).not.toHaveBeenCalled();
  });
});

describe("useCampaignAttributions", () => {
  it("exige as DUAS permissões, como o backend", async () => {
    session.can.mockImplementation((p: string) => p !== "campaigns.read");
    const { result } = renderHook(() => useCampaignAttributions("k1"), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(attributionMock.listByCampaign).not.toHaveBeenCalled();

    session.can.mockImplementation((p: string) => p !== "marketing.attribution.read");
    const semAttr = renderHook(() => useCampaignAttributions("k1"), { wrapper });
    await waitFor(() => expect(semAttr.result.current.fetchStatus).toBe("idle"));
    expect(attributionMock.listByCampaign).not.toHaveBeenCalled();
  });

  it("com as duas, busca com a paginação", async () => {
    attributionMock.listByCampaign.mockResolvedValue({
      items: [],
      total: 0,
      contactCount: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    const { result } = renderHook(() => useCampaignAttributions("k1", { page: 1, limit: 10 }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(attributionMock.listByCampaign).toHaveBeenCalledWith("k1", { page: 1, limit: 10 });
  });
});

describe("mutações e invalidação escopada", () => {
  it("criar atribuição invalida atribuições E o contato (source pode ter sido preenchido)", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    attributionMock.create.mockResolvedValue(attribution());
    const { result } = renderHook(() => useCreateAttribution("c1"), { wrapper });
    await result.current.mutateAsync({ leadSourceId: "s1" });
    const keys = spy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys).toContainEqual(["marketing", "attributions"]);
    expect(keys).toContainEqual(["crm", "contact", "c1"]);
  });

  it("corrigir o vínculo envia só o que o contrato aceita", async () => {
    attributionMock.update.mockResolvedValue(attribution());
    const { result } = renderHook(() => useUpdateAttribution("a1", "c1"), { wrapper });
    await result.current.mutateAsync({ campaignId: null });
    expect(attributionMock.update).toHaveBeenCalledWith("a1", { campaignId: null });
  });

  it("remover invalida o histórico", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    attributionMock.remove.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useDeleteAttribution("c1"), { wrapper });
    await result.current.mutateAsync("a1");
    expect(spy.mock.calls.map((c) => c[0]?.queryKey)).toContainEqual(["marketing", "attributions"]);
  });

  it("mexer no catálogo invalida também as atribuições (o nome aparece nelas)", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    leadSourcesMock.create.mockResolvedValue(leadSource("s9"));
    const { result } = renderHook(() => useCreateLeadSource(), { wrapper });
    await result.current.mutateAsync({ name: "Nova" });
    const keys = spy.mock.calls.map((c) => c[0]?.queryKey);
    expect(keys).toContainEqual(["marketing", "lead-sources"]);
    expect(keys).toContainEqual(["marketing", "attributions"]);
  });

  it("setup e delete de origem nunca invalidam CRM nem messaging", async () => {
    const spy = vi.spyOn(qc, "invalidateQueries");
    leadSourcesMock.setup.mockResolvedValue({ items: [] });
    leadSourcesMock.remove.mockResolvedValue({ message: "ok" });
    const setup = renderHook(() => useSetupLeadSources(), { wrapper });
    await setup.result.current.mutateAsync();
    const del = renderHook(() => useDeleteLeadSource(), { wrapper });
    await del.result.current.mutateAsync("s1");
    const roots = spy.mock.calls.map((c) => c[0]?.queryKey?.[0]);
    expect(roots.every((r) => r === "marketing")).toBe(true);
  });
});
