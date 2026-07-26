import { describe, expect, it } from "vitest";
import type { ApiPublicMessageListItem } from "@/types/api/messaging";
import {
  buildTimeline,
  findFirstUnreadId,
  flattenTimelinePages,
  formatTimelineDay,
  shouldGroupMessages,
} from "@/features/inbox/timeline";
import { toTimelineMessage } from "@/features/inbox/view-models";

function m(over: Partial<ApiPublicMessageListItem>): ApiPublicMessageListItem {
  return {
    id: "m",
    direction: "INBOUND",
    type: "TEXT",
    text: "x",
    status: "SENT",
    createdAt: "2026-07-27T10:00:00.000Z",
    scheduledAt: null,
    sentAt: null,
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    failure: null,
    visibility: "PUBLIC",
    ...over,
  } as ApiPublicMessageListItem;
}
const page = (items: ApiPublicMessageListItem[]) => ({ items });

describe("flattenTimelinePages", () => {
  it("combina páginas, deduplica por id e ordena antigo→novo", () => {
    // páginas do backend: mais recentes primeiro
    const p1 = page([m({ id: "b", createdAt: "2026-07-27T10:02:00Z" }), m({ id: "a", createdAt: "2026-07-27T10:01:00Z" })]);
    const p2 = page([m({ id: "a", createdAt: "2026-07-27T10:01:00Z" }), m({ id: "z", createdAt: "2026-07-27T10:00:00Z" })]);
    const flat = flattenTimelinePages([p1, p2]);
    expect(flat.map((x) => x.id)).toEqual(["z", "a", "b"]); // ordem visual + dedupe
  });

  it("desempata por id quando createdAt igual; imutável", () => {
    const items = [m({ id: "y", createdAt: "t" }), m({ id: "x", createdAt: "t" })];
    const orig = [...items];
    const flat = flattenTimelinePages([page(items)]);
    expect(flat.map((x) => x.id)).toEqual(["x", "y"]);
    expect(items).toEqual(orig); // não mutou
  });

  it("vazio/undefined → []", () => {
    expect(flattenTimelinePages(undefined)).toEqual([]);
    expect(flattenTimelinePages([])).toEqual([]);
  });
});

describe("shouldGroupMessages", () => {
  const vm = (o: Partial<ApiPublicMessageListItem>) => toTimelineMessage(m(o));
  it("agrupa mesmo autor/direção/tempo curto", () => {
    expect(shouldGroupMessages(vm({ createdAt: "2026-07-27T10:00:00Z" }), vm({ createdAt: "2026-07-27T10:01:00Z" }))).toBe(true);
  });
  it("quebra por direção", () => {
    expect(shouldGroupMessages(vm({ direction: "INBOUND" }), vm({ direction: "OUTBOUND" }))).toBe(false);
  });
  it("quebra por visibility (interna x pública)", () => {
    expect(shouldGroupMessages(vm({ visibility: "PUBLIC" }), vm({ visibility: "INTERNAL", direction: "OUTBOUND" }))).toBe(false);
  });
  it("sistema nunca agrupa", () => {
    expect(shouldGroupMessages(vm({ direction: "SYSTEM" }), vm({ direction: "SYSTEM" }))).toBe(false);
  });
  it("quebra por intervalo grande", () => {
    expect(shouldGroupMessages(vm({ createdAt: "2026-07-27T10:00:00Z" }), vm({ createdAt: "2026-07-27T10:30:00Z" }))).toBe(false);
  });
  it("quebra por autor diferente (outbound)", () => {
    expect(
      shouldGroupMessages(
        vm({ direction: "OUTBOUND", senderUserId: "u1" }),
        vm({ direction: "OUTBOUND", senderUserId: "u2" }),
      ),
    ).toBe(false);
  });
});

describe("formatTimelineDay", () => {
  const now = new Date("2026-07-27T12:00:00");
  it("Hoje/Ontem/semana/antigo", () => {
    expect(formatTimelineDay("2026-07-27T09:00:00", now)).toBe("Hoje");
    expect(formatTimelineDay("2026-07-26T09:00:00", now)).toBe("Ontem");
    expect(formatTimelineDay("2026-07-01T09:00:00", now)).toMatch(/\/2026/);
  });
});

describe("findFirstUnreadId", () => {
  const ordered = [
    m({ id: "o1", direction: "OUTBOUND" }),
    m({ id: "i1", direction: "INBOUND" }),
    m({ id: "i2", direction: "INBOUND" }),
    m({ id: "i3", direction: "INBOUND" }),
  ];
  it("N não-lidas → N-ésima inbound do fim", () => {
    expect(findFirstUnreadId(ordered, 2)).toBe("i2");
    expect(findFirstUnreadId(ordered, 1)).toBe("i3");
  });
  it("0/undefined → null; ignora notas internas", () => {
    expect(findFirstUnreadId(ordered, 0)).toBeNull();
    expect(findFirstUnreadId([m({ id: "n", direction: "OUTBOUND", visibility: "INTERNAL" })], 1)).toBeNull();
  });
  it("mais não-lidas que carregadas → primeira inbound (conservador)", () => {
    expect(findFirstUnreadId(ordered, 99)).toBe("i1");
  });
});

describe("buildTimeline", () => {
  const now = new Date("2026-07-27T12:00:00Z");
  it("insere separador de dia na transição e metadados de grupo", () => {
    const ordered = flattenTimelinePages([
      page([
        m({ id: "a", createdAt: "2026-07-26T10:00:00Z" }),
        m({ id: "b", createdAt: "2026-07-27T10:00:00Z" }),
        m({ id: "c", createdAt: "2026-07-27T10:01:00Z" }),
      ]),
    ]);
    const items = buildTimeline(ordered, { now });
    const kinds = items.map((i) => i.kind);
    expect(kinds.filter((k) => k === "day").length).toBe(2); // 26 e 27
    // b e c agrupam (mesmo dia/autor/tempo curto)
    const b = items.find((i) => i.kind === "message" && i.id === "b");
    const c = items.find((i) => i.kind === "message" && i.id === "c");
    expect(b && b.kind === "message" && b.group.firstInGroup).toBe(true);
    expect(c && c.kind === "message" && c.group.lastInGroup).toBe(true);
  });

  it("insere separador de não-lidas uma única vez antes da 1ª não lida", () => {
    const ordered = flattenTimelinePages([
      page([
        m({ id: "a", direction: "OUTBOUND", createdAt: "2026-07-27T10:00:00Z" }),
        m({ id: "b", direction: "INBOUND", createdAt: "2026-07-27T10:01:00Z" }),
      ]),
    ]);
    const items = buildTimeline(ordered, { now, firstUnreadId: "b" });
    const unread = items.filter((i) => i.kind === "unread");
    expect(unread).toHaveLength(1);
    const unreadIdx = items.findIndex((i) => i.kind === "unread");
    const bIdx = items.findIndex((i) => i.kind === "message" && i.id === "b");
    expect(unreadIdx).toBeLessThan(bIdx);
  });

  it("sem firstUnreadId → nenhum separador de não-lidas", () => {
    const ordered = flattenTimelinePages([page([m({ id: "a" })])]);
    expect(buildTimeline(ordered, { now }).some((i) => i.kind === "unread")).toBe(false);
  });
});
