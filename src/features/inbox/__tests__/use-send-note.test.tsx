import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { messagingInvalidation } from "@/lib/query/keys";
import type { ApiMessage, ApiPublicMessageListItems } from "@/types/api/messaging";

const createInternalNote = vi.fn();
vi.mock("@/lib/api/messaging/client", () => ({
  messagingApi: { createInternalNote: (...a: unknown[]) => createInternalNote(...a) },
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: () => true }),
}));

import { useSendInternalNote } from "@/features/inbox/hooks/use-send-note";

const KEY = [...messagingInvalidation.messages("c1"), "co1", "public"];
function seed(qc: QueryClient) {
  qc.setQueryData(KEY, {
    pages: [{ items: [{ id: "in1", direction: "INBOUND", type: "TEXT", text: "oi", status: "SENT", createdAt: "2026-07-27T11:00:00Z", scheduledAt: null, sentAt: null, deliveredAt: null, readAt: null, failedAt: null, failure: null } as never], nextCursor: null, hasMore: false }],
    pageParams: [undefined],
  } satisfies InfiniteData<ApiPublicMessageListItems>);
}
const server = (over: Partial<ApiMessage> = {}): ApiMessage => ({
  id: "n9", conversationId: "c1", messagingAccountId: "acc", direction: "OUTBOUND", type: "TEXT",
  status: "SENT", preview: "obs", hasMedia: false, mediaId: null, replyToMessageId: null,
  errorCode: null, sentAt: "2026-07-27T12:00:00Z", deliveredAt: null, readAt: null, failedAt: null,
  receivedAt: null, createdAt: "2026-07-27T12:00:00Z", updatedAt: "2026-07-27T12:00:00Z", ...over,
});
const items = (qc: QueryClient) =>
  (qc.getQueryData(KEY) as InfiniteData<ApiPublicMessageListItems>).pages[0].items;

function wrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  seed(qc);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, Wrapper };
}

afterEach(() => vi.clearAllMocks());

describe("useSendInternalNote — nota otimista (F3)", () => {
  it("onMutate insere nota INTERNAL na hora; onSuccess reconcilia p/ id real (INTERNAL)", async () => {
    let resolve!: (m: ApiMessage) => void;
    createInternalNote.mockReturnValue(new Promise<ApiMessage>((r) => { resolve = r; }));
    const { qc, Wrapper } = wrap();
    const { result } = renderHook(() => useSendInternalNote("c1"), { wrapper: Wrapper });

    act(() => { result.current.mutate({ text: "obs interna", clientMessageId: "c1" }); });

    await waitFor(() => expect(items(qc).some((m) => m.id === "temp:c1")).toBe(true));
    const temp = items(qc).find((m) => m.id === "temp:c1")!;
    expect(temp.visibility).toBe("INTERNAL"); // renderiza como nota, nunca pública
    expect(temp.direction).toBe("OUTBOUND");

    await act(async () => { resolve(server()); });
    await waitFor(() => expect(items(qc).some((m) => m.id === "n9")).toBe(true));
    const real = items(qc).find((m) => m.id === "n9")!;
    expect(real.visibility).toBe("INTERNAL");
    expect(real.text).toBe("obs interna"); // texto local (o response traz preview, não text)
    expect(items(qc).some((m) => m.id === "temp:c1")).toBe(false);
  });

  it("onError REMOVE a temp (sem nota fantasma)", async () => {
    createInternalNote.mockRejectedValue(new Error("500"));
    const { qc, Wrapper } = wrap();
    const { result } = renderHook(() => useSendInternalNote("c1"), { wrapper: Wrapper });

    act(() => { result.current.mutate({ text: "obs", clientMessageId: "c1" }); });
    await waitFor(() => expect(items(qc).some((m) => m.id === "temp:c1")).toBe(false));
    expect(items(qc).map((m) => m.id)).toEqual(["in1"]); // só a inbound original
  });
});
