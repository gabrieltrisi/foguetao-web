import { describe, it, expect, afterEach, vi } from "vitest";
import { z } from "zod";
import { backendFetch } from "@/lib/api/http";
import { isApiError } from "@/types/api/error";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("backendFetch", () => {
  it("valida a resposta com o schema Zod e retorna os dados", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { id: "1", name: "Owner" })));
    const schema = z.object({ id: z.string(), name: z.string() });
    const data = await backendFetch("/auth/me", { token: "at", schema });
    expect(data).toEqual({ id: "1", name: "Owner" });
  });

  type FetchCall = [string, { headers: Record<string, string> }];

  it("anexa Authorization Bearer e x-company-id", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await backendFetch("/companies/abc/context", { token: "the-token", companyId: "cid-123" });

    const [url, init] = fetchMock.mock.calls[0] as unknown as FetchCall;
    expect(url).toBe("http://localhost:3000/api/v1/companies/abc/context");
    expect(init.headers.authorization).toBe("Bearer the-token");
    expect(init.headers["x-company-id"]).toBe("cid-123");
  });

  it("não envia x-company-id quando não há empresa ativa", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await backendFetch("/auth/me", { token: "at" });
    const [, init] = fetchMock.mock.calls[0] as unknown as FetchCall;
    expect(init.headers["x-company-id"]).toBeUndefined();
  });

  it("encaminha o user-agent do navegador quando fornecido (hardening de sessão)", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await backendFetch("/auth/login", {
      method: "POST",
      body: { email: "a@b.com", password: "x" },
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/128",
    });
    const [, init] = fetchMock.mock.calls[0] as unknown as FetchCall;
    expect(init.headers["user-agent"]).toBe("Mozilla/5.0 (Windows NT 10.0) Chrome/128");
  });

  it("não envia user-agent quando ausente (o Next usaria o seu próprio)", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await backendFetch("/auth/me", { token: "at" });
    const [, init] = fetchMock.mock.calls[0] as unknown as FetchCall;
    expect(init.headers["user-agent"]).toBeUndefined();
  });

  it("401 → ApiError isUnauthorized", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      jsonResponse(401, { statusCode: 401, code: "UNAUTHORIZED", message: "Não autenticado" }),
    ));
    await expect(backendFetch("/auth/me", { token: "at" })).rejects.toMatchObject({
      statusCode: 401,
    });
    try {
      await backendFetch("/auth/me", { token: "at" });
    } catch (e) {
      expect(isApiError(e) && e.isUnauthorized).toBe(true);
    }
  });

  it("403 → ApiError isForbidden", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      jsonResponse(403, { statusCode: 403, code: "INSUFFICIENT_PERMISSION", message: "Sem permissão" }),
    ));
    try {
      await backendFetch("/companies/x/members", { token: "at", companyId: "x" });
      throw new Error("deveria ter lançado");
    } catch (e) {
      expect(isApiError(e) && e.isForbidden).toBe(true);
    }
  });

  it("falha de rede → ApiError indisponível (statusCode 0)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));
    try {
      await backendFetch("/auth/me", { token: "at" });
      throw new Error("deveria ter lançado");
    } catch (e) {
      expect(isApiError(e) && e.isUnavailable).toBe(true);
      expect(isApiError(e) && e.statusCode).toBe(0);
    }
  });
});
