import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import {
  buildOptimisticMessage,
  buildOptimisticNote,
  buildReconciledNote,
  clientMessageIdFromTempId,
  isTempId,
  localSendFailure,
  markTempFailed,
  reconcileServerMessage,
  removeTemp,
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

  it("preserva senderUserId da temp (o DTO público não expõe) — sem flip de grupo/rótulo (F2D D)", () => {
    const temp = buildOptimisticMessage({ clientMessageId: "c1", text: "olá", senderUserId: "u1", createdAt: "t" });
    const server = item({ id: "s99", direction: "OUTBOUND", text: "olá", status: "SENT", senderUserId: undefined });
    const out = reconcileServerMessage(cache([temp]), server, "temp:c1");
    const real = out?.pages[0].items.find((m) => m.id === "s99");
    expect(real?.senderUserId).toBe("u1");
  });

  it("colapsa só UMA temp por eco (textos iguais não somem — F2D E)", () => {
    const t1 = item({ id: "temp:c1", direction: "OUTBOUND", text: "ok", status: "SENDING", senderUserId: "u1" });
    const t2 = item({ id: "temp:c2", direction: "OUTBOUND", text: "ok", status: "SENDING", senderUserId: "u1" });
    const server = item({ id: "s1", direction: "OUTBOUND", text: "ok", status: "SENT" });
    const out = reconcileServerMessage(cache([t1, t2]), server); // eco do 1º
    // Uma temp permanece (a 2ª); a real entra. Nada some.
    expect(ids(out)).toContain("s1");
    expect(ids(out)).toContain("temp:c2");
    expect(ids(out)).not.toContain("temp:c1");
    expect(out?.pages[0].items).toHaveLength(2);
  });
});

describe("notas otimistas (F3)", () => {
  it("buildOptimisticNote → OUTBOUND/INTERNAL/SENDING (renderiza como nota)", () => {
    const n = buildOptimisticNote({ clientMessageId: "c1", text: "obs", senderUserId: "u1", createdAt: "t" });
    expect(n).toMatchObject({ id: "temp:c1", direction: "OUTBOUND", visibility: "INTERNAL", status: "SENDING", text: "obs" });
  });

  it("buildReconciledNote monta INTERNAL do texto local + id/timestamps do servidor", () => {
    const item = buildReconciledNote({ id: "n9", text: "obs", senderUserId: "u1", createdAt: "t", sentAt: "t2", status: "SENT", replyToMessageId: null });
    expect(item).toMatchObject({ id: "n9", visibility: "INTERNAL", text: "obs", status: "SENT", senderUserId: "u1" });
  });

  it("reconcilia nota temp → real preservando INTERNAL", () => {
    const temp = buildOptimisticNote({ clientMessageId: "c1", text: "obs", senderUserId: "u1", createdAt: "t" });
    const real = buildReconciledNote({ id: "n9", text: "obs", senderUserId: "u1", createdAt: "t", sentAt: "t2", status: "SENT", replyToMessageId: null });
    const out = reconcileServerMessage(cache([temp]), real, "temp:c1");
    const note = out?.pages[0].items.find((m) => m.id === "n9");
    expect(note?.visibility).toBe("INTERNAL");
    expect(ids(out)).toEqual(["n9"]);
  });

  it("ANTI-VAZAMENTO: eco SSE sem visibility NÃO rebaixa nota INTERNAL a pública", () => {
    // cache já tem a nota real (INTERNAL); chega um message.created sem visibility (base DTO).
    const noteInCache = buildReconciledNote({ id: "n9", text: "obs", senderUserId: "u1", createdAt: "t", sentAt: "t2", status: "SENT", replyToMessageId: null });
    const sseEcho = item({ id: "n9", direction: "OUTBOUND", text: "obs", status: "SENT" }); // sem visibility
    const out = reconcileServerMessage(cache([noteInCache]), sseEcho);
    expect(out?.pages[0].items.find((m) => m.id === "n9")?.visibility).toBe("INTERNAL");
  });
});

describe("removeTemp (F3 — falha de nota)", () => {
  it("remove a temp (sem nota fantasma)", () => {
    const temp = buildOptimisticNote({ clientMessageId: "c1", text: "x", senderUserId: "u1", createdAt: "t" });
    const out = removeTemp(cache([temp, item({ id: "s1" })]), "temp:c1");
    expect(ids(out)).toEqual(["s1"]);
  });
  it("no-op quando o tempId não existe", () => {
    const c = cache([item({ id: "s1" })]);
    expect(removeTemp(c, "temp:zzz")).toBe(c);
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
