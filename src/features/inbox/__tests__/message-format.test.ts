import { describe, expect, it } from "vitest";
import {
  fileExtension,
  formatFileSize,
  linkify,
  mediaKind,
  mediaKindLabel,
  messageAriaLabel,
} from "@/features/inbox/message-format";
import { toTimelineMessage } from "@/features/inbox/view-models";
import type { ApiPublicMessageListItem } from "@/types/api/messaging";

describe("linkify (seguro)", () => {
  it("detecta http/https/www e ignora protocolos perigosos", () => {
    const segs = linkify("veja https://a.com e www.b.com mas não javascript:alert(1)");
    const links = segs.filter((s) => s.type === "link");
    expect(links.map((l) => (l.type === "link" ? l.href : ""))).toEqual([
      "https://a.com",
      "https://www.b.com",
    ]);
    expect(segs.some((s) => s.type === "text" && s.value.includes("javascript:"))).toBe(true);
  });
  it("texto sem link → um segmento texto", () => {
    expect(linkify("só texto")).toEqual([{ type: "text", value: "só texto" }]);
  });
  it("vazio → []", () => {
    expect(linkify("")).toEqual([]);
  });
});

describe("mediaKind", () => {
  it("prioriza mimeType", () => {
    expect(mediaKind("DOCUMENT", "image/png")).toBe("image");
    expect(mediaKind(null, "video/mp4")).toBe("video");
    expect(mediaKind(null, "audio/ogg")).toBe("audio");
    expect(mediaKind(null, "application/pdf")).toBe("document");
    expect(mediaKind(null, "application/x-thing")).toBe("file");
  });
  it("cai no type quando não há mime", () => {
    expect(mediaKind("IMAGE")).toBe("image");
    expect(mediaKind("AUDIO")).toBe("audio");
    expect(mediaKind("TEXT")).toBe("unknown");
  });
  it("rótulos pt-BR", () => {
    expect(mediaKindLabel("image")).toBe("Imagem");
    expect(mediaKindLabel("document")).toBe("Documento");
  });
});

describe("formatFileSize / fileExtension", () => {
  it("B/KB/MB", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatFileSize(null)).toBeNull();
  });
  it("extensão em maiúsculas", () => {
    expect(fileExtension("relatorio.pdf")).toBe("PDF");
    expect(fileExtension("semext")).toBeNull();
  });
});

describe("messageAriaLabel", () => {
  const vm = (o: Partial<ApiPublicMessageListItem>) =>
    toTimelineMessage({
      id: "m", direction: "INBOUND", type: "TEXT", text: "oi", status: "SENT",
      createdAt: "t", scheduledAt: null, sentAt: null, deliveredAt: null, readAt: null,
      failedAt: null, failure: null, visibility: "PUBLIC", ...o,
    } as ApiPublicMessageListItem);
  it("descreve direção/autor/nota", () => {
    expect(messageAriaLabel(vm({ direction: "INBOUND" }), "Ana")).toMatch(/recebida de Ana/);
    expect(messageAriaLabel(vm({ direction: "OUTBOUND" }), "Você")).toMatch(/enviada por Você/);
    expect(messageAriaLabel(vm({ direction: "OUTBOUND", visibility: "INTERNAL" }), "Bia")).toMatch(/Nota interna de Bia/);
  });
});
