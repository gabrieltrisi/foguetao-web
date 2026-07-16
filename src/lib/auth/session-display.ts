import { isApiError } from "@/types/api/error";
import type { ApiSession } from "@/types/api/auth";

/**
 * Apresentação das sessões.
 *
 * O backend guarda e devolve apenas `userAgent` e `ipAddress` CRUS — não existem
 * campos `browser`, `os`, `device`, `location` nem `lastUsedAt` no modelo
 * `Session`. Tudo aqui é DERIVADO do que o contrato realmente entrega; nada é
 * inventado. O que não dá para derivar (localização, último acesso) simplesmente
 * não é exibido.
 */

/* ---------- User-Agent ---------- */

/**
 * A ordem importa: Edge/Opera/Brave também dizem "Chrome" no UA, e o Safari só
 * é Safari quando não é nenhum dos anteriores.
 */
const BROWSERS: { re: RegExp; name: string }[] = [
  { re: /\bEdg(e|A|iOS)?\//i, name: "Edge" },
  { re: /\bOPR\/|\bOpera\//i, name: "Opera" },
  { re: /\bFirefox\/|\bFxiOS\//i, name: "Firefox" },
  { re: /\bSamsungBrowser\//i, name: "Samsung Internet" },
  { re: /\bChrome\/|\bCriOS\//i, name: "Chrome" },
  { re: /\bSafari\//i, name: "Safari" },
  { re: /\bHeadlessChrome\//i, name: "Chrome (headless)" },
];

const OSES: { re: RegExp; name: string }[] = [
  { re: /\bWindows NT 10\.0/i, name: "Windows" },
  { re: /\bWindows/i, name: "Windows" },
  { re: /\biPhone|\biPad|\biPod/i, name: "iOS" },
  { re: /\bMac OS X|\bMacintosh/i, name: "macOS" },
  { re: /\bAndroid/i, name: "Android" },
  { re: /\bCrOS/i, name: "ChromeOS" },
  { re: /\bUbuntu/i, name: "Ubuntu" },
  { re: /\bLinux/i, name: "Linux" },
];

const MOBILE_RE = /\biPhone|\biPad|\biPod|\bAndroid|\bMobile\b/i;

export interface ParsedUserAgent {
  browser: string | null;
  os: string | null;
  isMobile: boolean;
  /** Rótulo pronto: "Chrome · Windows", "Chrome", ou null quando ilegível. */
  label: string | null;
}

/** Deriva navegador e sistema do UA. Devolve `null` quando não dá para saber. */
export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  if (!userAgent) return { browser: null, os: null, isMobile: false, label: null };

  const browser = BROWSERS.find((b) => b.re.test(userAgent))?.name ?? null;
  const os = OSES.find((o) => o.re.test(userAgent))?.name ?? null;
  const isMobile = MOBILE_RE.test(userAgent);
  const label = [browser, os].filter(Boolean).join(" · ") || null;

  return { browser, os, isMobile, label };
}

/** Rótulo do dispositivo, derivado do UA. Sem UA, não inventa um nome. */
export function deviceLabel(userAgent: string | null | undefined): string {
  const { os, isMobile } = parseUserAgent(userAgent);
  if (!userAgent) return "Dispositivo desconhecido";
  if (os) return isMobile ? `${os} (celular)` : os;
  return isMobile ? "Dispositivo móvel" : "Computador";
}

/* ---------- IP ---------- */

/**
 * Mascara o IP para exibição. O backend devolve o endereço COMPLETO — o
 * mascaramento é decisão da UI, para não deixar um IP inteiro exposto na tela.
 *
 * IPv4: mantém os dois primeiros octetos (`187.63.•••.•••`).
 * IPv6: mantém os dois primeiros grupos (`2804:14c:••••`).
 */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return "IP desconhecido";
  const value = ip.trim();

  // Localhost/loopback: não há o que mascarar (e ::1 não deve cair no ramo IPv6).
  if (value === "localhost" || value === "::1" || value === "127.0.0.1") return value;

  // IPv4 mapeado em IPv6 (::ffff:187.63.1.14) — trata como IPv4.
  const v4 = value.replace(/^::ffff:/i, "");
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v4);
  if (ipv4) return `${ipv4[1]}.${ipv4[2]}.•••.•••`;

  if (value.includes(":")) {
    const groups = value.split(":").filter(Boolean);
    if (groups.length >= 2) return `${groups[0]}:${groups[1]}:••••`;
    return "••••";
  }

  return "•••";
}

/* ---------- Datas ---------- */

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "expira em 29 dias" / "expira hoje" / "expirada". */
export function expiresLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const ms = d.getTime() - now.getTime();
  if (ms <= 0) return "expirada";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `expira em ${days} dia${days > 1 ? "s" : ""}`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `expira em ${hours}h`;
  return "expira em menos de 1h";
}

/** A sessão atual sempre primeiro; o resto por criação (mais recente antes). */
export function sortSessions(sessions: readonly ApiSession[]): ApiSession[] {
  return [...sessions].sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/* ---------- Erros ---------- */

export function messageForSessionError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "NOT_FOUND":
        return "Sessão não encontrada (talvez já tenha sido encerrada).";
      case "UNAUTHORIZED":
        return "Sua sessão expirou. Entre novamente.";
      case "TOO_MANY_REQUESTS":
        return "Muitas tentativas. Aguarde um instante e tente novamente.";
      case "VALIDATION_ERROR":
        return "Sessão inválida.";
      default:
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
