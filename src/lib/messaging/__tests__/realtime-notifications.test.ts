import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { parseRealtimeEnvelope } from "@/lib/messaging/realtime-events";
import { applyRealtimeEvent } from "@/lib/messaging/realtime-cache";

const CID = "11111111-1111-1111-1111-111111111111";

function envelope(data: Record<string, unknown>) {
  return JSON.stringify({
    id: "evt-1",
    version: 1,
    type: "notification.created",
    companyId: CID,
    occurredAt: "2026-08-01T10:00:00.000Z",
    data,
  });
}

const payload = {
  notificationId: "n-1",
  recipientUserId: "user-1",
  notificationType: "DEAL",
  priority: "HIGH",
};

describe("realtime notification.created — parsing", () => {
  it("valida payload de ids/metadados", () => {
    expect(parseRealtimeEnvelope(envelope(payload))?.type).toBe("notification.created");
  });

  it("rejeita payload sem recipientUserId (não confia no fio)", () => {
    expect(parseRealtimeEnvelope(envelope({ notificationId: "n-1" }))).toBeNull();
  });
});

describe("realtime notification.created — dispatch para o cache", () => {
  const qc = {} as QueryClient;

  it("destinatário = usuário logado → invalida o domínio de notificações", () => {
    const invalidate = vi.fn();
    const ev = parseRealtimeEnvelope(envelope(payload))!;
    applyRealtimeEvent(qc, ev, invalidate, "user-1");
    expect(invalidate.mock.calls.map((c) => c[0])).toContainEqual(["notifications"]);
  });

  it("notificação de OUTRO usuário → ignora (não invalida)", () => {
    const invalidate = vi.fn();
    const ev = parseRealtimeEnvelope(envelope(payload))!;
    applyRealtimeEvent(qc, ev, invalidate, "outro-user");
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("sem usuário conhecido → invalida (a query é escopada por sessão no servidor)", () => {
    const invalidate = vi.fn();
    const ev = parseRealtimeEnvelope(envelope(payload))!;
    applyRealtimeEvent(qc, ev, invalidate, undefined);
    expect(invalidate.mock.calls.map((c) => c[0])).toContainEqual(["notifications"]);
  });
});
