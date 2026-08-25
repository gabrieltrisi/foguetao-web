import type { TimelineMessageVM } from "@/features/inbox/view-models";

/**
 * Utilitários PUROS de apresentação de mensagem (F2B). Sem React. Detecção segura
 * de links, classificação de mídia por mimeType/tipo, tamanho de arquivo e rótulo
 * de acessibilidade. Nada executa HTML; links são validados (só http/https).
 */

export type TextSegment = { type: "text"; value: string } | { type: "link"; value: string; href: string };

// URLs http(s):// ou www. — sem capturar javascript:/data: (segurança).
const URL_RE = /((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/gi;

/** Quebra o texto em segmentos texto/link. NUNCA gera href não-http (evita XSS). */
export function linkify(text: string): TextSegment[] {
  if (!text) return [];
  const out: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const raw = match[0];
    const idx = match.index ?? 0;
    if (idx > last) out.push({ type: "text", value: text.slice(last, idx) });
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    // Validação final: só protocolos http/https viram link.
    let safe = false;
    try {
      const u = new URL(href);
      safe = u.protocol === "http:" || u.protocol === "https:";
    } catch {
      safe = false;
    }
    if (safe) out.push({ type: "link", value: raw, href });
    else out.push({ type: "text", value: raw });
    last = idx + raw.length;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

export type MediaKind = "image" | "video" | "audio" | "document" | "file" | "unknown";

/** Classifica a mídia priorizando o `mimeType`; cai no `type` da mensagem. */
export function mediaKind(messageType: string | null, mimeType?: string | null): MediaKind {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/") ||
      mimeType.includes("word") ||
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.includes("zip")
    )
      return "document";
    return "file";
  }
  switch (messageType) {
    case "IMAGE":
      return "image";
    case "VIDEO":
      return "video";
    case "AUDIO":
      return "audio";
    case "DOCUMENT":
      return "document";
    default:
      return "unknown";
  }
}

const KIND_LABEL: Record<MediaKind, string> = {
  image: "Imagem",
  video: "Vídeo",
  audio: "Áudio",
  document: "Documento",
  file: "Arquivo",
  unknown: "Anexo",
};
export function mediaKindLabel(kind: MediaKind): string {
  return KIND_LABEL[kind];
}

/** Tamanho humano (KB/MB) — pt-BR. */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (bytes == null || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

/** Extensão amigável do nome (para o card de documento). */
export function fileExtension(filename: string | null | undefined): string | null {
  if (!filename) return null;
  const dot = filename.lastIndexOf(".");
  return dot > 0 && dot < filename.length - 1 ? filename.slice(dot + 1).toUpperCase() : null;
}

/** Rótulo de acessibilidade da mensagem (direção + tipo + autor implícito). */
export function messageAriaLabel(m: TimelineMessageVM, senderName: string): string {
  const who =
    m.kind === "internal"
      ? `Nota interna de ${senderName}`
      : m.direction === "OUTBOUND"
        ? `Mensagem enviada por ${senderName}`
        : `Mensagem recebida de ${senderName}`;
  const body = m.text ? `: ${m.text.slice(0, 120)}` : m.hasMedia ? " com anexo" : "";
  return `${who}${body}`;
}
