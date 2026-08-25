import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

const unreadCount = vi.fn().mockResolvedValue({ count: 0 });
vi.mock("@/lib/api/notifications/client", () => ({
  notificationsApi: { unreadCount: (...a: unknown[]) => unreadCount(...a) },
}));

const can = vi.fn().mockReturnValue(true);
vi.mock("@/providers/session-provider", () => ({
  useSession: () => ({ user: { id: "u1" }, activeCompanyId: "co1", can: (p: string) => can(p) }),
}));

const flagEnabled = vi.fn().mockReturnValue(true);
vi.mock("../flag", () => ({ isNotificationCenterEnabled: () => flagEnabled() }));

import { NotificationBell } from "../components/notification-bell";

function renderBell() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
  can.mockReturnValue(true);
  flagEnabled.mockReturnValue(true);
});

describe("NotificationBell — self-gate", () => {
  it("não renderiza nada quando a feature flag está desligada", () => {
    flagEnabled.mockReturnValue(false);
    const { container } = renderBell();
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza sem a permissão notifications.read", () => {
    can.mockReturnValue(false);
    const { container } = renderBell();
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza o sino quando flag ligada + permissão", () => {
    renderBell();
    expect(screen.getByRole("button", { name: /notificações/i })).toBeInTheDocument();
  });
});
