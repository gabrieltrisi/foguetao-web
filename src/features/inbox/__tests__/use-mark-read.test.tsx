import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";

const markRead = vi.fn().mockResolvedValue({});
vi.mock("@/lib/api/messaging/client", () => ({
  messagingApi: { markRead: (...a: unknown[]) => markRead(...a) },
}));
const can = vi.fn().mockReturnValue(true);
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: (p: string) => can(p) }),
}));

import { useMarkConversationReadOnView } from "@/features/inbox/hooks/use-mark-read";

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const W = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  W.displayName = "TestWrapper";
  return W;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  can.mockReturnValue(true);
});

describe("useMarkConversationReadOnView (F2C)", () => {
  it("marca lida quando há não-lidas + no final + janela ativa (após debounce)", async () => {
    renderHook(
      () => useMarkConversationReadOnView({ conversationId: "c1", hasUnread: true, isAtBottom: true }),
      { wrapper: wrapper() },
    );
    expect(markRead).not.toHaveBeenCalled(); // ainda no debounce
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(markRead).toHaveBeenCalledTimes(1);
    expect(markRead).toHaveBeenCalledWith("c1");
  });

  it("NÃO marca quando está lendo histórico (isAtBottom=false)", () => {
    renderHook(
      () => useMarkConversationReadOnView({ conversationId: "c1", hasUnread: true, isAtBottom: false }),
      { wrapper: wrapper() },
    );
    act(() => { vi.advanceTimersByTime(2000); });
    expect(markRead).not.toHaveBeenCalled();
  });

  it("NÃO marca sem a permissão de update", () => {
    can.mockReturnValue(false);
    renderHook(
      () => useMarkConversationReadOnView({ conversationId: "c1", hasUnread: true, isAtBottom: true }),
      { wrapper: wrapper() },
    );
    act(() => { vi.advanceTimersByTime(2000); });
    expect(markRead).not.toHaveBeenCalled();
  });

  it("NÃO marca quando não há não-lidas", () => {
    renderHook(
      () => useMarkConversationReadOnView({ conversationId: "c1", hasUnread: false, isAtBottom: true }),
      { wrapper: wrapper() },
    );
    act(() => { vi.advanceTimersByTime(2000); });
    expect(markRead).not.toHaveBeenCalled();
  });

  it("marca só uma vez por ciclo de não-lidas (não repete)", async () => {
    const { rerender } = renderHook(
      (props: { hasUnread: boolean }) =>
        useMarkConversationReadOnView({ conversationId: "c1", hasUnread: props.hasUnread, isAtBottom: true }),
      { wrapper: wrapper(), initialProps: { hasUnread: true } },
    );
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(markRead).toHaveBeenCalledTimes(1);
    // re-render mantendo unread → não marca de novo
    rerender({ hasUnread: true });
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(markRead).toHaveBeenCalledTimes(1);
  });
});
