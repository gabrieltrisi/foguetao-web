import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import {
  buildOptimisticMessage,
  clientMessageIdFromTempId,
  isTempId,
  localSendFailure,
  markTempFailed,
  reconcileServerMessage,
  tempIdFor,
  upsertMessage,
} from "@/features/inbox/optimistic";
import type { ApiPublicMessageListItem, ApiPublicMessageListItems } from "@/types/api/messaging";

function item(over: Partial<ApiPublicMessageListItem> = {}): ApiPublicMessageListItem {
  return {
    id: "s1", direction: "INBOUND", type: "TEXT", text: "oi", status: "SENT",
    createdAt: "2026-07-27T12:00:00.000Z", scheduledAt: null, sentAt: null, deliveredAt: null,
    readAt: null, failedAt: null, failure: null, ...over,
  } as ApiPublicMessageListItem;
}
function cache(items: ApiPublicMessageListItem[]): InfiniteData<ApiPublicMessageListItems> {
  return { pages: [{ items, nextCursor: null, hasMore: false }], pageParams: [undefined] };
}
const ids = (d?: InfiniteData<ApiPublicMessageListItems>) => d?.pages[0].items.map((m) => m.id);

describe("tempId helpers", () => {
  it("tempIdFor / isTempId / clientMessageIdFromTempId são inversos", () => {
    const id = tempIdFor("abc");
    expect(id).toBe("temp:abc");
    expect(isTempId(id)).toBe(true);
    expect(isTempId("s1")).toBe(false);
    expect(clientMessageIdFromTempId(id)).toBe("abc");
    expect(clientMessageIdFromTempId("s1")).toBeNull();
  });
});

describe("buildOptimisticMessage", () => {
  it("monta OUTBOUND/SENDING com id temp e texto", () => {
    const m = buildOptimisticMessage({ clientMessageId: "c1", text: "olá", senderUserId: "u1", createdAt: "t" });
    expect(m).toMatchObject({ id: "temp:c1", direction: "OUTBOUND", status: "SENDING", text: "olá", senderUserId: "u1", hasMedia: false });
  });
});

describe("upsertMessage", () => {
  it("insere no topo (mais recente)", () => {
    const out = upsertMessage(cache([item({ id: "old" })]), item({ id: "new" }));
    expect(ids(out)).toEqual(["new", "old"]);
  });
  it("idempotente por id: substitui sem duplicar", () => {
    const out = upsertMessage(cache([item({ id: "m", status: "QUEUED" })]), item({ id: "m", status: "SENT" }));
    expect(out?.pages[0].items).toHaveLength(1);
    expect(out?.pages[0].items[0].status).toBe("SENT");
  });
  it("no-op sem cache", () => {
    expect(upsertMessage(undefined, item())).toBeUndefined();
  });
});

describe("reconcileServerMessage", () => {
  it("substitui a temp pelo id real via tempId do contexto", () => {
    const temp = buildOptimisticMessage({ clientMessageId: "c1", text: "olá", senderUserId: "u1", createdAt: "t" });
    const server = item({ id: "s99", direction: "OUTBOUND", text: "olá", status: "SENT" });
    const out = reconcileServerMessage(cache([temp]), server, "temp:c1");
    expect(ids(out)).toEqual(["s99"]);
  });

  it("colapsa o ECO por SSE (sem tempId): temp OUTBOUND pendente de mesmo texto some", () => {
    const temp = buildOptimisticMessage({ clientMessageId: "c1", text: "olá", senderUserId: "u1", createdAt: "t" });
    const server = item({ id: "s99", direction: "OUTBOUND", text: "olá", status: "DELIVERED" });
    const out = reconcileServerMessage(cache([temp]), server); // eco: sem tempId
    expect(ids(out)).toEqual(["s99"]);
    expect(out?.pages[0].items).toHaveLength(1);
  });

  it("NÃO colapsa mensagem inbound (só há temp em outbound)", () => {
    const other = item({ id: "temp:x", direction: "OUTBOUND", text: "outro", status: "SENDING" });
    const server = item({ id: "in1", direction: "INBOUND", text: "recebida" });
    const out = reconcileServerMessage(cache([other]), server);
    expect(ids(out)).toEqual(["in1", "temp:x"]);
  });

  it("idempotente com o eco: reaplicar não duplica o id real", () => {
    const server = item({ id: "s99", direction: "OUTBOUND", text: "olá", status: "SENT" });
    const once = reconcileServerMessage(cache([server]), server);
    expect(ids(once)).toEqual(["s99"]);
  });

  it("não colapsa temp já terminal (FAILED) de mesmo texto", () => {
    const failed = item({ id: "temp:c1", direction: "OUTBOUND", text: "olá", status: "FAILED" });
    const server = item({ id: "s99", direction: "OUTBOUND", text: "olá", status: "SENT" });
    const out = reconcileServerMessage(cache([failed]), server); // eco sem tempId
    expect(ids(out)).toEqual(["s99", "temp:c1"]);
  });
});

describe("markTempFailed", () => {
  it("marca FAILED preservando o texto/posição", () => {
    const temp = buildOptimisticMessage({ clientMessageId: "c1", text: "olá", senderUserId: "u1", createdAt: "t" });
    const out = markTempFailed(cache([temp]), "temp:c1", localSendFailure("Sem conexão"));
    expect(out?.pages[0].items[0]).toMatchObject({ id: "temp:c1", status: "FAILED", text: "olá" });
    expect(out?.pages[0].items[0].failure).toMatchObject({ code: "LOCAL_SEND_FAILED", retryable: true, message: "Sem conexão" });
  });
  it("no-op quando o tempId não existe", () => {
    const c = cache([item({ id: "s1" })]);
    expect(markTempFailed(c, "temp:zzz", localSendFailure("x"))).toBe(c);
  });
});
