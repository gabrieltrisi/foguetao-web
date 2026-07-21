import { normalizeSegmentId } from "@/config/landing/segments";
import type { SegmentId } from "@/config/landing/segments";

/** Nome do parâmetro de URL: `?segment=academia`. */
export const SEGMENT_PARAM = "segment";
/** Cookie de preferência (NÃO é segredo — é UX). Legível no client. */
export const SEGMENT_COOKIE = "fg_segment";
/** Chave no localStorage (backup abaixo do cookie na prioridade). */
export const SEGMENT_STORAGE_KEY = "fg_segment";
/** 1 ano — a escolha do visitante persiste entre sessões. */
export const SEGMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * String do cookie de preferência `fg_segment`. Atributos:
 *  - `Path=/`               — vale em toda a landing;
 *  - `SameSite=Lax`         — preferência de UX, não é credencial;
 *  - `Max-Age` ~1 ano       — a escolha persiste entre sessões;
 *  - `Secure` só em HTTPS    — evita quebrar o localhost (http) em dev;
 *  - SEM `HttpOnly`          — é lido/escrito pelo cliente (não é auth).
 *
 * Este cookie NUNCA é usado para autenticação/autorização — só marketing/UX.
 */
export function segmentCookieString(id: SegmentId): string {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  return `${SEGMENT_COOKIE}=${id}; path=/; max-age=${SEGMENT_COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

/** Persiste a preferência no cliente: cookie + localStorage (best-effort). */
export function persistSegment(id: SegmentId): void {
  try {
    document.cookie = segmentCookieString(id);
    window.localStorage.setItem(SEGMENT_STORAGE_KEY, id);
  } catch {
    // navegação privada / storage indisponível — segue só com a URL
  }
}

/**
 * Acrescenta `?segment=` a um href interno, preservando o segmento nos CTAs
 * (ex.: `/register` → `/register?segment=academia`). Para `default`, devolve o
 * href sem o parâmetro — a landing geral não polui as URLs.
 */
export function withSegment(href: string, segment: SegmentId): string {
  if (normalizeSegmentId(segment) === "default") return href;
  const [path, hash] = href.split("#");
  const sep = path.includes("?") ? "&" : "?";
  const url = `${path}${sep}${SEGMENT_PARAM}=${segment}`;
  return hash ? `${url}#${hash}` : url;
}
