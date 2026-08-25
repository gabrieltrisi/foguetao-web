import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ApiConversationDetail } from "@/types/api/messaging";

const api = vi.hoisted(() => ({
  assign: vi.fn().mockResolvedValue({}),
  resolve: vi.fn().mockResolvedValue({}),
  reopen: vi.fn().mockResolvedValue({}),
  archive: vi.fn().mockResolvedValue({}),
  addConversationLabel: vi.fn().mockResolvedValue({}),
  removeConversationLabel: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/api/messaging/client", () => ({ messagingApi: api }));

import {
  useAssignConversation,
  useChangeConversationStatus,
} from "@/features/inbox/hooks/use-inbox-mutations";
import { useConversationLabelMutation } from "@/features/inbox/hooks/use-inbox-labels";

const DETAIL_KEY = ["messaging", "conversation", "c1", "co1"];
function detail(over: Partial<ApiConversationDetail> = {}): ApiConversationDetail {
  return { id: "c1", status: "OPEN", assignedToUserId: null, labels: [], version: 3, ...over } as ApiConversationDetail;
}
function wrap(seed: ApiConversationDetail) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  qc.setQueryData(DETAIL_KEY, seed);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, Wrapper };
}
const read = (qc: QueryClient) => qc.getQueryData(DETAIL_KEY) as ApiConversationDetail;
afterEach(() => vi.clearAllMocks());

describe("Assignment (F4)", () => {
  it("assumir/transferir: patch otimista do responsável + envia expectedVersion", async () => {
    const { qc, Wrapper } = wrap(detail());
    const { result } = renderHook(() => useAssignConversation(), { wrapper: Wrapper });
    act(() => { result.current.mutate({ id: "c1", assignedToUserId: "u9", expectedVersion: 3 }); });
    // otimista: aparece na hora
    await waitFor(() => expect(read(qc).assignedToUserId).toBe("u9"));
    expect(api.assign).toHaveBeenCalledWith("c1", "u9", 3);
  });

  it("remover: assignedToUserId=null (otimista)", async () => {
    const { qc, Wrapper } = wrap(detail({ assignedToUserId: "u9" }));
    const { result } = renderHook(() => useAssignConversation(), { wrapper: Wrapper });
    act(() => { result.current.mutate({ id: "c1", assignedToUserId: null }); });
    await waitFor(() => expect(read(qc).assignedToUserId).toBeNull());
    expect(api.assign).toHaveBeenCalledWith("c1", null, undefined);
  });

  it("erro (409): rollback do responsável", async () => {
    api.assign.mockRejectedValueOnce(new Error("409"));
    const { qc, Wrapper } = wrap(detail({ assignedToUserId: null }));
    const { result } = renderHook(() => useAssignConversation(), { wrapper: Wrapper });
    act(() => { result.current.mutate({ id: "c1", assignedToUserId: "u9" }); });
    await waitFor(() => expect(read(qc).assignedToUserId).toBeNull()); // voltou ao original
  });
});

describe("Status (F4)", () => {
  it("resolver: status→RESOLVED otimista", async () => {
    const { qc, Wrapper } = wrap(detail({ status: "OPEN" }));
    const { result } = renderHook(() => useChangeConversationStatus(), { wrapper: Wrapper });
    act(() => { result.current.resolve.mutate("c1"); });
    await waitFor(() => expect(read(qc).status).toBe("RESOLVED"));
    expect(api.resolve).toHaveBeenCalledWith("c1");
  });

  it("reabrir: status→OPEN; arquivar: status→ARCHIVED", async () => {
    const { qc, Wrapper } = wrap(detail({ status: "RESOLVED" }));
    const { result } = renderHook(() => useChangeConversationStatus(), { wrapper: Wrapper });
    act(() => { result.current.reopen.mutate("c1"); });
    await waitFor(() => expect(read(qc).status).toBe("OPEN"));
    act(() => { result.current.archive.mutate("c1"); });
    await waitFor(() => expect(read(qc).status).toBe("ARCHIVED"));
  });

  it("erro (422 transição): rollback do status", async () => {
    api.resolve.mockRejectedValueOnce(new Error("422"));
    const { qc, Wrapper } = wrap(detail({ status: "OPEN" }));
    const { result } = renderHook(() => useChangeConversationStatus(), { wrapper: Wrapper });
    act(() => { result.current.resolve.mutate("c1"); });
    await waitFor(() => expect(read(qc).status).toBe("OPEN"));
  });
});

describe("Labels (F4)", () => {
  it("adicionar: chip otimista (append); múltiplas labels", async () => {
    const { qc, Wrapper } = wrap(detail({ labels: [{ id: "l1", name: "VIP", color: "#f00" }] }));
    const { result } = renderHook(() => useConversationLabelMutation(), { wrapper: Wrapper });
    act(() => {
      result.current.add.mutate({ conversationId: "c1", labelId: "l2", label: { id: "l2", name: "Urgente", color: "#00f" } });
    });
    await waitFor(() => expect(read(qc).labels?.map((l) => l.id)).toEqual(["l1", "l2"]));
    expect(api.addConversationLabel).toHaveBeenCalledWith("c1", "l2");
  });

  it("remover: filtra o chip otimista", async () => {
    const { qc, Wrapper } = wrap(detail({ labels: [{ id: "l1", name: "VIP", color: "#f00" }, { id: "l2", name: "Urgente", color: "#00f" }] }));
    const { result } = renderHook(() => useConversationLabelMutation(), { wrapper: Wrapper });
    act(() => { result.current.remove.mutate({ conversationId: "c1", labelId: "l1" }); });
    await waitFor(() => expect(read(qc).labels?.map((l) => l.id)).toEqual(["l2"]));
    expect(api.removeConversationLabel).toHaveBeenCalledWith("c1", "l1");
  });

  it("adicionar idempotente: não duplica label já presente", async () => {
    const { qc, Wrapper } = wrap(detail({ labels: [{ id: "l1", name: "VIP", color: "#f00" }] }));
    const { result } = renderHook(() => useConversationLabelMutation(), { wrapper: Wrapper });
    act(() => {
      result.current.add.mutate({ conversationId: "c1", labelId: "l1", label: { id: "l1", name: "VIP", color: "#f00" } });
    });
    await waitFor(() => expect(api.addConversationLabel).toHaveBeenCalled());
    expect(read(qc).labels?.map((l) => l.id)).toEqual(["l1"]);
  });
});
