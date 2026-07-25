import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import { upsertNewestMessage } from "@/hooks/messaging/use-inbox";
import type { ApiPublicMessage, ApiPublicMessageList } from "@/types/api/messaging";

function message(over: Partial<ApiPublicMessage> = {}): ApiPublicMessage {
  return {
    id: "m1",
    direction: "OUTBOUND",
    type: "TEXT",
    text: "Olá",
    status: "QUEUED",
    createdAt: "2026-07-16T12:00:00.000Z",
    scheduledAt: null,
    sentAt: null,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    ...over,
  };
}

function cache(items: ApiPublicMessage[]): InfiniteData<ApiPublicMessageList> {
  return {
    pages: [{ items, nextCursor: null, hasMore: false }],
    pageParams: [undefined],
  };
}

describe("upsertNewestMessage (Bloco 3 — cache)", () => {
  it("insere a mensagem no topo da primeira página (mais recente)", () => {
    const out = upsertNewestMessage(cache([message({ id: "old" })]), message({ id: "new" }));
    expect(out?.pages[0].items.map((m) => m.id)).toEqual(["new", "old"]);
  });

  it("é idempotente: mesmo id substitui, não duplica (reenvio)", () => {
    const out = upsertNewestMessage(
      cache([message({ id: "m1", status: "QUEUED" })]),
      message({ id: "m1", status: "SENT" }),
    );
    expect(out?.pages[0].items).toHaveLength(1);
    expect(out?.pages[0].items[0].status).toBe("SENT");
  });

  it("no-op quando não há cache ainda (undefined)", () => {
    expect(upsertNewestMessage(undefined, message())).toBeUndefined();
  });
});
