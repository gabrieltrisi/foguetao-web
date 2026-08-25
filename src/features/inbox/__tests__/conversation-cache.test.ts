import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { patchConversationDetail } from "@/features/inbox/conversation-cache";
import type { ApiConversationDetail } from "@/types/api/messaging";

const detail = (over: Partial<ApiConversationDetail> = {}): ApiConversationDetail =>
  ({ id: "c1", status: "OPEN", assignedToUserId: null, labels: [], version: 1, ...over }) as ApiConversationDetail;

const DETAIL_KEY = ["messaging", "conversation", "c1", "co1"];
const MESSAGES_KEY = ["messaging", "conversation", "c1", "messages", {}, "co1", "public"];
const DRAFT_KEY = ["messaging", "conversation", "c1", "draft", "co1"];

describe("patchConversationDetail (F4)", () => {
  it("faz patch SÓ do detalhe (nunca mensagens/rascunho que compartilham o prefixo)", () => {
    const qc = new QueryClient();
    qc.setQueryData(DETAIL_KEY, detail());
    qc.setQueryData(MESSAGES_KEY, { pages: [{ items: [{ id: "m" }] }] });
    qc.setQueryData(DRAFT_KEY, { text: "rascunho" });

    patchConversationDetail(qc, "c1", (c) => ({ ...c, status: "RESOLVED" }));

    expect((qc.getQueryData(DETAIL_KEY) as ApiConversationDetail).status).toBe("RESOLVED");
    // messages e draft intocados:
    expect(qc.getQueryData(MESSAGES_KEY)).toEqual({ pages: [{ items: [{ id: "m" }] }] });
    expect(qc.getQueryData(DRAFT_KEY)).toEqual({ text: "rascunho" });
  });

  it("rollback restaura o snapshot", () => {
    const qc = new QueryClient();
    qc.setQueryData(DETAIL_KEY, detail({ assignedToUserId: null }));
    const rollback = patchConversationDetail(qc, "c1", (c) => ({ ...c, assignedToUserId: "u2" }));
    expect((qc.getQueryData(DETAIL_KEY) as ApiConversationDetail).assignedToUserId).toBe("u2");
    rollback();
    expect((qc.getQueryData(DETAIL_KEY) as ApiConversationDetail).assignedToUserId).toBeNull();
  });

  it("no-op seguro quando o detalhe não está em cache", () => {
    const qc = new QueryClient();
    const rollback = patchConversationDetail(qc, "c1", (c) => ({ ...c, status: "OPEN" }));
    expect(qc.getQueryData(DETAIL_KEY)).toBeUndefined();
    expect(() => rollback()).not.toThrow();
  });
});
