import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { messagingInvalidation } from "@/lib/query/keys";
import type { ApiPublicMessage, ApiPublicMessageListItems } from "@/types/api/messaging";

const sendConversationMessage = vi.fn();
vi.mock("@/lib/api/messaging/client", () => ({
  messagingApi: { sendConversationMessage: (...a: unknown[]) => sendConversationMessage(...a) },
}));
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: () => true }),
}));

import { useSendInboxMessage } from "@/hooks/messaging/use-inbox";

const KEY = [...messagingInvalidation.messages("c1"), "co1", "public"];
function seed(qc: QueryClient) {
  const data: InfiniteData<ApiPublicMessageListItems> = {
    pages: [{ items: [{ id: "in1", direction: "INBOUND", type: "TEXT", text: "oi", status: "SENT", createdAt: "2026-07-27T11:00:00Z", scheduledAt: null, sentAt: null, deliveredAt: null, readAt: null, failedAt: null, failure: null } as never], nextCursor: null, hasMore: false }],
    pageParams: [undefined],
  };
  qc.setQueryData(KEY, data);
}
const server = (over: Partial<ApiPublicMessage> = {}): ApiPublicMessage => ({
  id: "s99", direction: "OUTBOUND", type: "TEXT", text: "olá", status: "SENT",
  createdAt: "2026-07-27T12:00:00Z", scheduledAt: null, sentAt: null, deliveredAt: null,
  readAt: null, failedAt: null, failure: null, ...over,
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

describe("useSendInboxMessage — envio otimista (F2C)", () => {
  it("onMutate insere a temp SENDING imediatamente; onSuccess reconcilia p/ id real", async () => {
    let resolve!: (m: ApiPublicMessage) => void;
    sendConversationMessage.mockReturnValue(new Promise<ApiPublicMessage>((r) => { resolve = r; }));
    const { qc, Wrapper } = wrap();
    const { result } = renderHook(() => useSendInboxMessage("c1"), { wrapper: Wrapper });

    act(() => { result.current.mutate({ text: "olá", clientMessageId: "c1" }); });

    // Otimista: aparece na hora, status SENDING, id temp.
    await waitFor(() => expect(items(qc).some((m) => m.id === "temp:c1")).toBe(true));
    const temp = items(qc).find((m) => m.id === "temp:c1")!;
    expect(temp.status).toBe("SENDING");
    expect(temp.direction).toBe("OUTBOUND");

    // Servidor responde → reconciliação: temp some, entra id real.
    await act(async () => { resolve(server()); });
    await waitFor(() => expect(items(qc).some((m) => m.id === "s99")).toBe(true));
    expect(items(qc).some((m) => m.id === "temp:c1")).toBe(false);
  });

  it("onError marca a temp FAILED preservando o texto (retryable)", async () => {
    sendConversationMessage.mockRejectedValue(new Error("network"));
    const { qc, Wrapper } = wrap();
    const { result } = renderHook(() => useSendInboxMessage("c1"), { wrapper: Wrapper });

    act(() => { result.current.mutate({ text: "olá", clientMessageId: "c1" }); });

    await waitFor(() => {
      const t = items(qc).find((m) => m.id === "temp:c1");
      expect(t?.status).toBe("FAILED");
    });
    const failed = items(qc).find((m) => m.id === "temp:c1")!;
    expect(failed.text).toBe("olá"); // texto nunca se perde
    expect(failed.failure?.retryable).toBe(true);
  });

  it("agendada (sendAt) NÃO é otimista — nenhuma temp é criada", async () => {
    sendConversationMessage.mockResolvedValue(server({ id: "sched1", status: "QUEUED" }));
    const { qc, Wrapper } = wrap();
    const { result } = renderHook(() => useSendInboxMessage("c1"), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ text: "depois", clientMessageId: "c2", sendAt: "2026-08-01T10:00:00Z" });
    });
    expect(items(qc).some((m) => m.id.startsWith("temp:"))).toBe(false);
  });
});
