import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { parseRealtimeEnvelope } from "@/lib/messaging/realtime-events";
import { applyRealtimeEvent } from "@/lib/messaging/realtime-cache";

const CID = "11111111-1111-1111-1111-111111111111";

function envelope(type: string, data: Record<string, unknown>) {
  return JSON.stringify({
    id: "evt-1",
    version: 1,
    type,
    companyId: CID,
    occurredAt: "2026-08-01T10:00:00.000Z",
    data,
  });
}

const metricsData = {
  campaignId: "camp-1",
  eligible: 10,
  processed: 4,
  progressPercentage: 40,
  sent: 4,
  delivered: 3,
  read: 1,
  failed: 0,
};

describe("realtime campaign.* — parsing", () => {
  it("valida campaign.progress e campaign.started; rejeita payload inválido", () => {
    expect(parseRealtimeEnvelope(envelope("campaign.progress", metricsData))?.type).toBe(
      "campaign.progress",
    );
    expect(
      parseRealtimeEnvelope(envelope("campaign.started", { campaignId: "c", status: "SENDING", at: "x" }))
        ?.type,
    ).toBe("campaign.started");
    // metrics payload faltando campo → null (não confia no fio)
    expect(parseRealtimeEnvelope(envelope("campaign.progress", { campaignId: "c" }))).toBeNull();
  });
});

describe("realtime campaign.* — dispatch para o cache", () => {
  const qc = {} as QueryClient;

  it("progress → invalida métricas + listas (não toca detalhe/timeline)", () => {
    const invalidate = vi.fn();
    const ev = parseRealtimeEnvelope(envelope("campaign.progress", metricsData))!;
    applyRealtimeEvent(qc, ev, invalidate);
    const keys = invalidate.mock.calls.map((c) => c[0]);
    expect(keys).toContainEqual(["messaging-campaigns", "metrics", "camp-1"]);
    expect(keys).toContainEqual(["messaging-campaigns", "list"]);
    expect(keys).not.toContainEqual(["messaging-campaigns", "timeline", "camp-1"]);
  });

  it("completed → invalida detalhe + métricas + timeline + listas", () => {
    const invalidate = vi.fn();
    const ev = parseRealtimeEnvelope(
      envelope("campaign.completed", { campaignId: "camp-1", status: "COMPLETED", at: "x" }),
    )!;
    applyRealtimeEvent(qc, ev, invalidate);
    const keys = invalidate.mock.calls.map((c) => c[0]);
    expect(keys).toContainEqual(["messaging-campaigns", "one", "camp-1"]);
    expect(keys).toContainEqual(["messaging-campaigns", "metrics", "camp-1"]);
    expect(keys).toContainEqual(["messaging-campaigns", "timeline", "camp-1"]);
    expect(keys).toContainEqual(["messaging-campaigns", "list"]);
  });
});
