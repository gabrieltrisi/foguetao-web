import { describe, expect, it } from "vitest";
import {
  activeAdvancedCount,
  buildInboxSearch,
  parseInboxSearch,
  resolveFilters,
  viewToFilters,
} from "@/features/inbox/url-state";
import { channelPresentation, formatConversationTime, previewText } from "@/features/inbox/format";

const parse = (qs: string) => parseInboxSearch(new URLSearchParams(qs));

describe("parseInboxSearch (normaliza inválidos)", () => {
  it("lê seleção + view + filtros conhecidos", () => {
    const s = parse("c=abc&view=mine&status=OPEN&channel=WHATSAPP&label=l1&assigned=u1&owner=o1&archived=1");
    expect(s.selectedId).toBe("abc");
    expect(s.view).toBe("mine");
    expect(s.advanced).toMatchObject({
      status: "OPEN",
      channel: "WHATSAPP",
      labelId: "l1",
      assignedToUserId: "u1",
      ownerId: "o1",
      archived: true,
    });
  });

  it("ignora view/status/channel inválidos com segurança", () => {
    const s = parse("view=telepathy&status=NOPE&channel=FAX");
    expect(s.view).toBe("all");
    expect(s.advanced.status).toBeUndefined();
    expect(s.advanced.channel).toBeUndefined();
  });
});

describe("buildInboxSearch (round-trip)", () => {
  it("omite chaves vazias e faz round-trip", () => {
    const state = parse("c=x&view=unread&label=l9");
    const qs = buildInboxSearch(state);
    expect(parse(qs)).toEqual(state);
    // view 'all' não aparece na URL
    expect(buildInboxSearch({ view: "all", advanced: {} })).toBe("");
  });
});

describe("viewToFilters / resolveFilters", () => {
  it("mapeia as views para filtros do backend", () => {
    expect(viewToFilters("mine", "u1")).toEqual({ assignedToUserId: "u1" });
    expect(viewToFilters("mine", null)).toEqual({});
    expect(viewToFilters("unread", "u1")).toEqual({ unreadOnly: true });
    expect(viewToFilters("open", "u1")).toEqual({ status: "OPEN" });
    expect(viewToFilters("closed", "u1")).toEqual({ status: "RESOLVED" });
    expect(viewToFilters("all", "u1")).toEqual({});
  });

  it("filtro avançado de status vence o da view; agrega busca", () => {
    const state = parse("view=open&status=RESOLVED&label=l1");
    const f = resolveFilters(state, "u1", "ana");
    expect(f.status).toBe("RESOLVED"); // avançado vence
    expect(f.labelId).toBe("l1");
    expect(f.search).toBe("ana");
  });

  it("conta filtros avançados ativos", () => {
    expect(activeAdvancedCount({ status: "OPEN", labelId: "l" })).toBe(2);
    expect(activeAdvancedCount({})).toBe(0);
  });
});

describe("format helpers", () => {
  it("canal com rótulo acessível", () => {
    expect(channelPresentation("WHATSAPP")).toEqual({ key: "whatsapp", label: "WhatsApp" });
    expect(channelPresentation(undefined).label).toBe("Canal");
  });

  it("preview: texto → fallback por tipo → genérico", () => {
    expect(previewText({ preview: "ola", type: "TEXT" })).toBe("ola");
    expect(previewText({ preview: null, type: "IMAGE" })).toBe("Imagem");
    expect(previewText({ preview: "", type: "AUDIO" })).toBe("Áudio");
    expect(previewText({ preview: null, type: "ZZZ" })).toBe("Mensagem não suportada");
    expect(previewText(null)).toBeNull();
  });

  it("tempo relativo: hoje→hora, ontem, semana, antigo", () => {
    const now = new Date("2026-07-27T12:00:00");
    expect(formatConversationTime("2026-07-27T09:30:00", now)).toMatch(/\d{2}:\d{2}/);
    expect(formatConversationTime("2026-07-26T09:30:00", now)).toBe("Ontem");
    expect(formatConversationTime("2026-07-01T09:30:00", now)).toMatch(/\d{2}\/\d{2}/);
    expect(formatConversationTime(null, now)).toBe("");
  });
});
