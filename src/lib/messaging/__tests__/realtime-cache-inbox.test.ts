import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { applyRealtimeEvent, type ScheduleInvalidate } from "@/lib/messaging/realtime-cache";
import type { RealtimeEvent } from "@/lib/messaging/realtime-events";
import type { ApiConversationList } from "@/types/api/messaging";

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

describe("applyRealtimeEvent — inbox operacional (C3.1B/C/D)", () => {
  const opEvents: RealtimeEvent[] = [
    { ...ENV, type: "conversation.assigned", data: { conversationId: "c1", assignedToUserId: "u9" } },
    { ...ENV, type: "conversation.unassigned", data: { conversationId: "c1" } },
    { ...ENV, type: "conversation.ownerChanged", data: { conversationId: "c1", ownerId: null } },
    { ...ENV, type: "conversation.labeled", data: { conversationId: "c1", labelId: "l1", added: true } },
    { ...ENV, type: "conversation.closed", data: { conversationId: "c1", at: "t" } },
    { ...ENV, type: "conversation.reopened", data: { conversationId: "c1", at: "t" } },
  ];

  it.each(opEvents)("$type invalida conversa + listas (reconciliação HTTP)", (event) => {
    applyRealtimeEvent(qc, event, invalidate);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversation", "c1"]);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });

  it("draft.saved / draft.deleted invalidam SÓ a query do rascunho da conversa", () => {
    applyRealtimeEvent(
      qc,
      { ...ENV, type: "draft.saved", data: { conversationId: "c1", userId: "u1", updatedAt: "t" } },
      invalidate,
    );
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversation", "c1", "draft"]);
    invalidate.mockClear();
    applyRealtimeEvent(
      qc,
      { ...ENV, type: "draft.deleted", data: { conversationId: "c1", userId: "u1" } },
      invalidate,
    );
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversation", "c1", "draft"]);
    // Não toca listas de conversa (rascunho é por usuário).
    expect(invalidate).not.toHaveBeenCalledWith(["messaging", "conversations"]);
  });

  it("account.updated invalida contas + listas (sendability pode mudar)", () => {
    applyRealtimeEvent(
      qc,
      { ...ENV, type: "account.updated", data: { accountId: "a1", status: "CONNECTED", at: "t" } },
      invalidate,
    );
    expect(invalidate).toHaveBeenCalledWith(["messaging", "accounts"]);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });

  it("conversation.read POR USUÁRIO (sem unreadCount) NÃO zera unread global — só invalida", () => {
    const LIST_KEY = ["messaging", "conversations", {}, "co1", "infinite"];
    qc.setQueryData(LIST_KEY, {
      pages: [
        {
          items: [{ id: "c1", unreadCount: 4 }] as unknown as ApiConversationList["items"],
          nextCursor: null,
          hasMore: false,
        },
      ],
      pageParams: [undefined],
    });
    applyRealtimeEvent(
      qc,
      {
        ...ENV,
        type: "conversation.read",
        data: { conversationId: "c1", userId: "u1", lastReadMessageId: "m9", updatedAt: "t" },
      },
      invalidate,
    );
    const items = qc.getQueryData<InfiniteData<ApiConversationList>>(LIST_KEY)?.pages[0]
      .items as unknown as { id: string; unreadCount: number }[];
    // unread GLOBAL preservado (a leitura é por usuário; refetch reconcilia unreadForUser).
    expect(items[0].unreadCount).toBe(4);
    expect(invalidate).toHaveBeenCalledWith(["messaging", "conversations"]);
  });
});
