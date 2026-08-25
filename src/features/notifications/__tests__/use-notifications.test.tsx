import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const list = vi.fn();
const unreadCount = vi.fn();
vi.mock("@/lib/api/notifications/client", () => ({
  notificationsApi: {
    list: (...a: unknown[]) => list(...a),
    unreadCount: (...a: unknown[]) => unreadCount(...a),
  },
}));

const can = vi.fn().mockReturnValue(true);
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: (p: string) => can(p) }),
}));

// Feature flag ligada nos testes de hook.
vi.mock("../flag", () => ({ isNotificationCenterEnabled: () => true }));

import { useNotifications, useUnreadCount } from "../hooks/use-notifications";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const W = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  W.displayName = "TestWrapper";
  return W;
}

afterEach(() => {
  vi.clearAllMocks();
  can.mockReturnValue(true);
});

describe("useNotifications", () => {
  it("lista paginado e acumula itens das páginas", async () => {
    list.mockResolvedValue({ items: [{ id: "n1" }, { id: "n2" }], page: 1, limit: 15, total: 2, totalPages: 1 });
    const { result } = renderHook(() => useNotifications({ status: "all" }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].items).toHaveLength(2);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ status: "all", page: 1, limit: 15 }));
  });

  it("não dispara sem a permissão notifications.read", async () => {
    can.mockReturnValue(false);
    list.mockResolvedValue({ items: [], page: 1, limit: 15, total: 0, totalPages: 1 });
    const { result } = renderHook(() => useNotifications(), { wrapper: wrapper() });
    // Query desabilitada: fica em estado pending sem chamar a API.
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(list).not.toHaveBeenCalled();
  });
});

describe("useUnreadCount", () => {
  it("seleciona apenas o número do contador", async () => {
    unreadCount.mockResolvedValue({ count: 7 });
    const { result } = renderHook(() => useUnreadCount(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(7);
  });
});
