import { describe, expect, it } from "vitest";
import { parseRealtimeEnvelope, REALTIME_EVENT_TYPES } from "@/lib/messaging/realtime-events";

function frame(type: string, data: unknown) {
  return JSON.stringify({
    id: "e1",
    version: 1,
    type,
    companyId: "co1",
    occurredAt: "2026-07-27T12:00:00.000Z",
    data,
  });
}

describe("parseRealtimeEnvelope — eventos operacionais (C3.1B/C/D)", () => {
  it("aceita os eventos dedicados da Inbox", () => {
    expect(
      parseRealtimeEnvelope(
        frame(REALTIME_EVENT_TYPES.CONVERSATION_ASSIGNED, {
          conversationId: "c1",
          assignedToUserId: "u1",
        }),
      )?.type,
    ).toBe("conversation.assigned");
    expect(
      parseRealtimeEnvelope(
        frame(REALTIME_EVENT_TYPES.CONVERSATION_OWNER_CHANGED, {
          conversationId: "c1",
          ownerId: null,
        }),
      )?.type,
    ).toBe("conversation.ownerChanged");
    expect(
      parseRealtimeEnvelope(
        frame(REALTIME_EVENT_TYPES.CONVERSATION_LABELED, {
          conversationId: "c1",
          labelId: "l1",
          added: false,
        }),
      )?.type,
    ).toBe("conversation.labeled");
    expect(
      parseRealtimeEnvelope(frame(REALTIME_EVENT_TYPES.CONVERSATION_CLOSED, { conversationId: "c1", at: "t" }))
        ?.type,
    ).toBe("conversation.closed");
    expect(
      parseRealtimeEnvelope(frame(REALTIME_EVENT_TYPES.DRAFT_DELETED, { conversationId: "c1", userId: "u1" }))
        ?.type,
    ).toBe("draft.deleted");
    expect(
      parseRealtimeEnvelope(
        frame(REALTIME_EVENT_TYPES.ACCOUNT_UPDATED, { accountId: "a1", status: "CONNECTED", at: "t" }),
      )?.type,
    ).toBe("account.updated");
  });

  it("conversation.read aceita a forma POR USUÁRIO (userId + lastReadMessageId, sem unreadCount)", () => {
    const e = parseRealtimeEnvelope(
      frame(REALTIME_EVENT_TYPES.CONVERSATION_READ, {
        conversationId: "c1",
        userId: "u1",
        lastReadMessageId: "m9",
        updatedAt: "t",
      }),
    );
    expect(e?.type).toBe("conversation.read");
  });

  it("conversation.read continua aceitando a forma LEGADA (unreadCount:0)", () => {
    const e = parseRealtimeEnvelope(
      frame(REALTIME_EVENT_TYPES.CONVERSATION_READ, {
        conversationId: "c1",
        unreadCount: 0,
        updatedAt: "t",
      }),
    );
    expect(e).not.toBeNull();
  });

  it("evento desconhecido → null (ignorado com segurança)", () => {
    expect(parseRealtimeEnvelope(frame("conversation.telepathy", { conversationId: "c1" }))).toBeNull();
  });
});
