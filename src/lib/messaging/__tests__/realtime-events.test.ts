import { describe, expect, it } from "vitest";
import { parseRealtimeEnvelope, shouldApplyStatus } from "@/lib/messaging/realtime-events";

const message = {
  id: "m1",
  direction: "OUTBOUND",
  type: "TEXT",
  text: "oi",
  status: "SENT",
  createdAt: "2026-07-22T00:00:00.000Z",
  sentAt: "2026-07-22T00:00:00.000Z",
  deliveredAt: null,
  readAt: null,
  failedAt: null,
  failure: null,
};

const created = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    id: "evt-1",
    version: 1,
    type: "message.created",
    companyId: "co1",
    occurredAt: "2026-07-22T00:00:00.000Z",
    data: { conversationId: "conv1", message },
    ...over,
  });

describe("parseRealtimeEnvelope", () => {
  it("aceita um message.created válido", () => {
    const ev = parseRealtimeEnvelope(created());
    expect(ev?.type).toBe("message.created");
    expect(ev?.companyId).toBe("co1");
    if (ev?.type === "message.created") expect(ev.data.message.id).toBe("m1");
  });

  it("aceita os quatro tipos de evento", () => {
    const base = { id: "e", version: 1, companyId: "co1", occurredAt: "2026-07-22T00:00:00.000Z" };
    expect(
      parseRealtimeEnvelope(
        JSON.stringify({
          ...base,
          type: "message.statusChanged",
          data: { conversationId: "c", messageId: "m", status: "DELIVERED", updatedAt: "t" },
        }),
      )?.type,
    ).toBe("message.statusChanged");
    expect(
      parseRealtimeEnvelope(
        JSON.stringify({
          ...base,
          type: "conversation.updated",
          data: { conversationId: "c", reason: "ASSIGNED", updatedAt: "t" },
        }),
      )?.type,
    ).toBe("conversation.updated");
    expect(
      parseRealtimeEnvelope(
        JSON.stringify({
          ...base,
          type: "conversation.read",
          data: { conversationId: "c", unreadCount: 0, updatedAt: "t" },
        }),
      )?.type,
    ).toBe("conversation.read");
  });

  it("rejeita JSON inválido → null", () => {
    expect(parseRealtimeEnvelope("not-json{")).toBeNull();
  });

  it("rejeita version !== 1 → null", () => {
    expect(parseRealtimeEnvelope(created({ version: 2 }))).toBeNull();
  });

  it("rejeita type desconhecido → null", () => {
    expect(parseRealtimeEnvelope(created({ type: "message.deleted" }))).toBeNull();
  });

  it("rejeita status interno (não público) em statusChanged → null", () => {
    const raw = JSON.stringify({
      id: "e",
      version: 1,
      companyId: "co1",
      occurredAt: "t",
      type: "message.statusChanged",
      data: { conversationId: "c", messageId: "m", status: "RECEIVED", updatedAt: "t" },
    });
    expect(parseRealtimeEnvelope(raw)).toBeNull();
  });
});

describe("shouldApplyStatus (monotonicidade)", () => {
  it("avança na régua", () => {
    expect(shouldApplyStatus("QUEUED", "SENT")).toBe(true);
    expect(shouldApplyStatus("SENT", "DELIVERED")).toBe(true);
    expect(shouldApplyStatus("DELIVERED", "READ")).toBe(true);
  });

  it("NÃO regride (READ→DELIVERED, DELIVERED→SENT)", () => {
    expect(shouldApplyStatus("READ", "DELIVERED")).toBe(false);
    expect(shouldApplyStatus("DELIVERED", "SENT")).toBe(false);
  });

  it("ignora status igual", () => {
    expect(shouldApplyStatus("SENT", "SENT")).toBe(false);
  });

  it("FAILED aplica só a partir de pré-entrega; nunca regride DELIVERED/READ", () => {
    expect(shouldApplyStatus("SENT", "FAILED")).toBe(true);
    expect(shouldApplyStatus("QUEUED", "FAILED")).toBe(true);
    expect(shouldApplyStatus("DELIVERED", "FAILED")).toBe(false);
    expect(shouldApplyStatus("READ", "FAILED")).toBe(false);
  });
});
