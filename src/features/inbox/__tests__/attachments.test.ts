import { describe, expect, it } from "vitest";
import {
  attachmentKind,
  attachmentLabel,
  canPreviewImage,
  sanitizeFilename,
  validateFiles,
  type PendingAttachment,
} from "@/features/inbox/attachments";

const file = (name: string, type: string, size: number): File =>
  new File([new Uint8Array(size)], name, { type });

const config = { maxSizeBytes: 1000, maxCount: 2, allowedMimeTypes: ["image/png", "application/pdf"] };
const ids = (i: number) => `id-${i}`;

describe("sanitizeFilename (F5 — segurança)", () => {
  it("remove diretórios (path traversal)", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\temp\\a.png")).toBe("a.png");
  });
  it("troca caracteres perigosos mas PRESERVA dígitos/letras/espaço", () => {
    expect(sanitizeFilename('rel:2024?.png')).toBe("rel_2024_.png");
    expect(sanitizeFilename("foto 01.jpg")).toBe("foto 01.jpg");
  });
  it("vazio → fallback", () => {
    expect(sanitizeFilename("///")).toBe("arquivo");
  });
});

describe("attachmentKind / canPreviewImage", () => {
  it("kind por MIME (não extensão)", () => {
    expect(attachmentKind("image/png")).toBe("image");
    expect(attachmentKind("application/pdf")).toBe("document");
    expect(attachmentKind("video/mp4")).toBe("video");
    expect(attachmentKind("application/octet-stream")).toBe("file");
  });
  it("SVG NUNCA é preview de imagem (segurança)", () => {
    expect(canPreviewImage("image/png")).toBe(true);
    expect(canPreviewImage("image/svg+xml")).toBe(false);
    expect(canPreviewImage("application/pdf")).toBe(false);
  });
});

describe("validateFiles (F5)", () => {
  it("aceita arquivo válido dentro do limite/allowlist", () => {
    const { accepted, rejected } = validateFiles([file("a.png", "image/png", 500)], [], config, ids);
    expect(rejected).toHaveLength(0);
    expect(accepted[0]).toMatchObject({ name: "a.png", mime: "image/png", kind: "image", status: "ready" });
  });
  it("rejeita muito grande", () => {
    const { rejected } = validateFiles([file("a.png", "image/png", 2000)], [], config, ids);
    expect(rejected[0].reason).toBe("too-large");
  });
  it("rejeita tipo não permitido (por MIME)", () => {
    const { rejected } = validateFiles([file("a.zip", "application/zip", 100)], [], config, ids);
    expect(rejected[0].reason).toBe("type-not-allowed");
  });
  it("rejeita duplicado (nome+tamanho já na fila)", () => {
    const existing: PendingAttachment[] = [
      { id: "x", file: file("a.png", "image/png", 500), name: "a.png", size: 500, mime: "image/png", kind: "image", status: "ready" },
    ];
    const { rejected } = validateFiles([file("a.png", "image/png", 500)], existing, config, ids);
    expect(rejected[0].reason).toBe("duplicate");
  });
  it("rejeita excedente de quantidade", () => {
    const files = [file("a.png", "image/png", 100), file("b.png", "image/png", 100), file("c.png", "image/png", 100)];
    const { accepted, rejected } = validateFiles(files, [], config, ids);
    expect(accepted).toHaveLength(2); // maxCount=2
    expect(rejected[0].reason).toBe("too-many");
  });
  it("curinga image/* é aceito", () => {
    const { accepted } = validateFiles([file("a.gif", "image/gif", 100)], [], { ...config, allowedMimeTypes: ["image/*"] }, ids);
    expect(accepted).toHaveLength(1);
  });
});

describe("attachmentLabel", () => {
  it("nome · extensão · tamanho", () => {
    const a: PendingAttachment = { id: "x", file: file("relatorio.pdf", "application/pdf", 2048), name: "relatorio.pdf", size: 2048, mime: "application/pdf", kind: "document", status: "ready" };
    expect(attachmentLabel(a)).toContain("relatorio.pdf");
    expect(attachmentLabel(a)).toContain("PDF");
    expect(attachmentLabel(a)).toContain("2.0 KB");
  });
});
