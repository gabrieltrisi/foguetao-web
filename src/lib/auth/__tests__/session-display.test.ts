import { describe, it, expect } from "vitest";
import {
  parseUserAgent,
  deviceLabel,
  maskIp,
  formatDateTime,
  expiresLabel,
  sortSessions,
  messageForSessionError,
} from "@/lib/auth/session-display";
import { sessionSchema, sessionListSchema } from "@/types/api/auth";
import { ApiError } from "@/types/api/error";
import type { ApiSession } from "@/types/api/auth";

function session(over: Partial<ApiSession> = {}): ApiSession {
  return {
    id: "s1",
    userAgent: "Mozilla/5.0",
    ipAddress: "187.63.1.14",
    createdAt: "2026-07-14T12:00:00.000Z",
    expiresAt: "2026-08-13T12:00:00.000Z",
    current: false,
    ...over,
  };
}

describe("schema de sessão (contrato real)", () => {
  it("aceita a resposta exata do SessionResponseDto", () => {
    expect(sessionSchema.parse(session())).toMatchObject({ id: "s1", current: false });
  });

  it("userAgent e ipAddress podem ser nulos (o backend os grava nullable)", () => {
    const parsed = sessionSchema.parse(session({ userAgent: null, ipAddress: null }));
    expect(parsed.userAgent).toBeNull();
    expect(parsed.ipAddress).toBeNull();
  });

  it("NÃO tem os campos que o mock inventava (location, lastActive, device, os)", () => {
    const parsed = sessionSchema.parse(session()) as Record<string, unknown>;
    for (const ghost of ["location", "lastActive", "device", "browser", "os", "revokedAt"]) {
      expect(parsed).not.toHaveProperty(ghost);
    }
  });

  it("a lista é um array", () => {
    expect(sessionListSchema.parse([session(), session({ id: "s2" })])).toHaveLength(2);
  });
});

describe("parseUserAgent — derivação do UA real", () => {
  const cases: [string, string, string, boolean][] = [
    // UA, browser esperado, os esperado, isMobile
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
      "Chrome",
      "Windows",
      false,
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Safari",
      "macOS",
      false,
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 Edg/128.0",
      "Edge",
      "Windows",
      false,
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Safari",
      "iOS",
      true,
    ],
    [
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
      "Firefox",
      "Ubuntu",
      false,
    ],
    [
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36",
      "Chrome",
      "Android",
      true,
    ],
  ];

  it.each(cases)("classifica %s", (ua, browser, os, isMobile) => {
    const parsed = parseUserAgent(ua);
    expect(parsed.browser).toBe(browser);
    expect(parsed.os).toBe(os);
    expect(parsed.isMobile).toBe(isMobile);
    expect(parsed.label).toBe(`${browser} · ${os}`);
  });

  it("Edge/Opera não são confundidos com Chrome (ordem importa)", () => {
    expect(parseUserAgent("... Chrome/128 ... OPR/114").browser).toBe("Opera");
    expect(parseUserAgent("... Chrome/128 ... Edg/128").browser).toBe("Edge");
  });

  it("UA nulo ou ilegível não inventa nada", () => {
    expect(parseUserAgent(null)).toEqual({ browser: null, os: null, isMobile: false, label: null });
    expect(parseUserAgent("curl/8.0").label).toBeNull();
  });
});

describe("deviceLabel", () => {
  it("usa o SO derivado, marcando celular", () => {
    expect(deviceLabel("Mozilla/5.0 (Windows NT 10.0) Chrome/128")).toBe("Windows");
    expect(deviceLabel("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile Safari")).toBe(
      "iOS (celular)",
    );
  });

  it("sem SO cai em rótulos genéricos, nunca num nome fabricado", () => {
    expect(deviceLabel(null)).toBe("Dispositivo desconhecido");
    expect(deviceLabel("algo/1.0 Mobile")).toBe("Dispositivo móvel");
    expect(deviceLabel("algo/1.0")).toBe("Computador");
  });
});

describe("maskIp — o backend devolve o IP completo; a UI mascara", () => {
  it("IPv4 mantém só os dois primeiros octetos", () => {
    expect(maskIp("187.63.1.14")).toBe("187.63.•••.•••");
    expect(maskIp("201.17.200.3")).toBe("201.17.•••.•••");
  });

  it("IPv4 mapeado em IPv6 é tratado como IPv4", () => {
    expect(maskIp("::ffff:187.63.1.14")).toBe("187.63.•••.•••");
  });

  it("IPv6 mantém só os dois primeiros grupos", () => {
    expect(maskIp("2804:14c:5b8:8b2c:1:2:3:4")).toBe("2804:14c:••••");
  });

  it("localhost e nulos são tratados sem vazar nada falso", () => {
    expect(maskIp(null)).toBe("IP desconhecido");
    expect(maskIp("::1")).toBe("::1");
    expect(maskIp("localhost")).toBe("localhost");
  });

  it("nunca devolve o IP completo", () => {
    for (const ip of ["187.63.1.14", "201.17.200.3", "2804:14c:5b8:8b2c:1:2:3:4"]) {
      expect(maskIp(ip)).not.toContain(ip.split(/[.:]/).slice(-1)[0] === "" ? "zzz" : ip);
    }
  });
});

describe("datas e expiração", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");

  it("formata data/hora e trata nulos", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("lixo")).toBe("—");
    expect(formatDateTime("2026-07-14T12:00:00.000Z")).not.toBe("—");
  });

  it("expiresLabel cobre dias, horas e expirada", () => {
    expect(expiresLabel("2026-08-13T12:00:00.000Z", now)).toBe("expira em 30 dias");
    expect(expiresLabel("2026-07-15T12:00:00.000Z", now)).toBe("expira em 1 dia");
    expect(expiresLabel("2026-07-14T18:00:00.000Z", now)).toBe("expira em 6h");
    expect(expiresLabel("2026-07-14T12:30:00.000Z", now)).toBe("expira em menos de 1h");
    expect(expiresLabel("2026-07-13T12:00:00.000Z", now)).toBe("expirada");
  });
});

describe("sortSessions", () => {
  it("a sessão atual vem sempre primeiro", () => {
    const list = [
      session({ id: "a", current: false, createdAt: "2026-07-14T10:00:00.000Z" }),
      session({ id: "b", current: true, createdAt: "2026-07-10T10:00:00.000Z" }),
      session({ id: "c", current: false, createdAt: "2026-07-14T11:00:00.000Z" }),
    ];
    const sorted = sortSessions(list);
    expect(sorted[0].id).toBe("b");
    // as demais por criação, mais recente antes
    expect(sorted.slice(1).map((s) => s.id)).toEqual(["c", "a"]);
  });

  it("não muta o array original", () => {
    const list = [session({ id: "a" })];
    sortSessions(list);
    expect(list).toHaveLength(1);
  });
});

describe("erros de sessão", () => {
  const err = (code: string, statusCode: number, message = "msg do backend") =>
    new ApiError({ statusCode, code, message });

  it("404 sessão já encerrada", () => {
    expect(messageForSessionError(err("NOT_FOUND", 404))).toMatch(/não encontrada/i);
  });

  it("401 sessão expirada", () => {
    expect(messageForSessionError(err("UNAUTHORIZED", 401))).toMatch(/expirou/i);
  });

  it("429 muitas tentativas", () => {
    expect(messageForSessionError(err("TOO_MANY_REQUESTS", 429))).toMatch(/muitas tentativas/i);
  });

  it("backend indisponível", () => {
    expect(messageForSessionError(err("SERVICE_UNAVAILABLE", 0))).toMatch(/indisponível/i);
  });

  it("código desconhecido preserva a mensagem do backend", () => {
    expect(messageForSessionError(err("ALGO_NOVO", 400))).toBe("msg do backend");
  });

  it("erro não-API tem fallback e não vaza stack", () => {
    expect(messageForSessionError(new Error("at Object.<anonymous>"))).toBe(
      "Não foi possível concluir a ação.",
    );
  });
});
