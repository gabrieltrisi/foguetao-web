import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { applyRealtimeEvent, type ScheduleInvalidate } from "@/lib/messaging/realtime-cache";
import type { RealtimeEvent } from "@/lib/messaging/realtime-events";
import type {
  ApiConversationList,
  ApiPublicMessage,
  ApiPublicMessageList,
} from "@/types/api/messaging";

const MESSAGES_KEY = [
  "messaging",
  "conversation",
  "conv1",
  "messages",
  { limit: 30 },
  "co1",
  "public",
];
const LIST_KEY = ["messaging", "conversations", {}, "co1", "infinite"];

function msg(over: Partial<ApiPublicMessage> = {}): ApiPublicMessage {
  return {
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
    ...over,
  };
}

function messagesCache(items: ApiPublicMessage[]): InfiniteData<ApiPublicMessageList> {
  return { pages: [{ items, nextCursor: null, hasMore: false }], pageParams: [undefined] };
}

function listCache(
  items: { id: string; unreadCount: number }[],
): InfiniteData<ApiConversationList> {
  return {
    pages: [
      { items: items as unknown as ApiConversationList["items"], nextCursor: null, hasMore: false },
    ],
    pageParams: [undefined],
  };
}

const ENV = {
  id: "e",
  version: 1 as const,
  companyId: "co1",
  occurredAt: "2026-07-22T00:00:00.000Z",
};

let qc: QueryClient;
let invalidate: ScheduleInvalidate & ReturnType<typeof vi.fn>;

beforeEach(() => {
  qc = new QueryClient();
  invalidate = vi.fn() as ScheduleInvalidate & ReturnType<typeof vi.fn>;
});

function messagesItems() {
  return qc.getQueryData<InfiniteData<ApiPublicMessageList>>(MESSAGES_KEY)?.pages[0].items ?? [];
}

describe("applyRealtimeEvent (Fase 6.3C)", () => {
  it("message.created: faz upsert no topo da thread + agenda invalidação de listas", () => {
    qc.setQueryData(MESSAGES_KEY, messagesCache([msg({ id: "old" })]));
    const event: RealtimeEvent = {
      ...ENV,
      type: "message.created",
      data: { conversationId: "conv1", message: msg({ id: "new" }) },
    };
    applyRealtimeEvent(qc, event, invalidate);
    expect(messagesItems().map((m) => m.id)).toEqual(["new", "old"]);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversation", "conv1"]);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });

  it("message.created: idempotente por id (não duplica o otimista do envio)", () => {
    qc.setQueryData(MESSAGES_KEY, messagesCache([msg({ id: "m1", status: "QUEUED" })]));
    const event: RealtimeEvent = {
      ...ENV,
      type: "message.created",
      data: { conversationId: "conv1", message: msg({ id: "m1", status: "SENT" }) },
    };
    applyRealtimeEvent(qc, event, invalidate);
    expect(messagesItems()).toHaveLength(1);
    expect(messagesItems()[0].status).toBe("SENT");
  });

  it("message.statusChanged: avança o status; NÃO regride", () => {
    qc.setQueryData(MESSAGES_KEY, messagesCache([msg({ id: "m1", status: "SENT" })]));
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "message.statusChanged",
        data: { conversationId: "conv1", messageId: "m1", status: "DELIVERED", updatedAt: "t" },
      },
      invalidate,
    );
    expect(messagesItems()[0].status).toBe("DELIVERED");
    // evento fora de ordem (SENT sobre DELIVERED) é ignorado
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "message.statusChanged",
        data: { conversationId: "conv1", messageId: "m1", status: "SENT", updatedAt: "t" },
      },
      invalidate,
    );
    expect(messagesItems()[0].status).toBe("DELIVERED");
  });

  it("message.statusChanged FAILED: aplica failure sanitizado", () => {
    qc.setQueryData(MESSAGES_KEY, messagesCache([msg({ id: "m1", status: "SENT" })]));
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "message.statusChanged",
        data: {
          conversationId: "conv1",
          messageId: "m1",
          status: "FAILED",
          updatedAt: "t",
          failure: { code: "X", retryable: false, message: "falhou" },
        },
      },
      invalidate,
    );
    expect(messagesItems()[0].status).toBe("FAILED");
    expect(messagesItems()[0].failure?.message).toBe("falhou");
  });

  it("conversation.updated: agenda invalidação de conversa + listas (sem mexer em cache)", () => {
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "conversation.updated",
        data: { conversationId: "conv1", reason: "ASSIGNED", updatedAt: "t" },
      },
      invalidate,
    );
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversation", "conv1"]);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });

  it("conversation.read: zera unreadCount imediatamente nas listas + invalida", () => {
    qc.setQueryData(
      LIST_KEY,
      listCache([
        { id: "conv1", unreadCount: 3 },
        { id: "conv2", unreadCount: 5 },
      ]),
    );
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "conversation.read",
        data: { conversationId: "conv1", unreadCount: 0, updatedAt: "t" },
      },
      invalidate,
    );
    const items = qc.getQueryData<InfiniteData<ApiConversationList>>(LIST_KEY)?.pages[0]
      .items as unknown as {
      id: string;
      unreadCount: number;
    }[];
    expect(items.find((c) => c.id === "conv1")?.unreadCount).toBe(0);
    expect(items.find((c) => c.id === "conv2")?.unreadCount).toBe(5); // não toca outras
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });
});
