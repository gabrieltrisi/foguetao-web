import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// withCompany invoca o handler com token+empresa já resolvidos (refresh é testado
// no módulo de sessão). Aqui focamos no comportamento de streaming do BFF.
vi.mock("@/lib/auth/session", () => ({
  withCompany: (fn: (ctx: { token: string; companyId: string }) => Promise<Response>) =>
    fn({ token: "tok-123", companyId: "co1" }),
}));

import { GET } from "./route";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => vi.unstubAllGlobals());

function streamResponse() {
  return {
    status: 200,
    ok: true,
    body: new ReadableStream(),
    json: vi.fn(),
  };
}

function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/messaging/stream", { headers });
}

describe("BFF GET /api/messaging/stream (Fase 6.3B)", () => {
  it("encaminha Authorization, X-Company-Id e Accept: text/event-stream ao backend", async () => {
    mockFetch.mockResolvedValue(streamResponse());
    await GET(req());
    const [url, opts] = mockFetch.mock.calls[0];
    expect(String(url)).toContain("/api/v1/messaging/stream");
    expect(opts.headers.authorization).toBe("Bearer tok-123");
    expect(opts.headers["x-company-id"]).toBe("co1");
    expect(opts.headers.accept).toBe("text/event-stream");
  });

  it("encaminha Last-Event-ID quando presente", async () => {
    mockFetch.mockResolvedValue(streamResponse());
    await GET(req({ "last-event-id": "evt-42" }));
    expect(mockFetch.mock.calls[0][1].headers["last-event-id"]).toBe("evt-42");
  });

  it("propaga o AbortSignal do navegador ao fetch do backend", async () => {
    mockFetch.mockResolvedValue(streamResponse());
    const request = req();
    await GET(request);
    expect(mockFetch.mock.calls[0][1].signal).toBe(request.signal);
  });

  it("200: repassa o body como stream, com headers SSE e SEM chamar json()", async () => {
    const upstream = streamResponse();
    mockFetch.mockResolvedValue(upstream);
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    expect(res.headers.get("cache-control")).toBe("no-cache, no-transform");
    expect(res.headers.get("x-accel-buffering")).toBe("no");
    expect(res.body).toBe(upstream.body);
    expect(upstream.json).not.toHaveBeenCalled();
  });

  it("não expõe o access token ao browser (nenhum header/corpo com o token)", async () => {
    mockFetch.mockResolvedValue(streamResponse());
    const res = await GET(req());
    expect(res.headers.get("authorization")).toBeNull();
    expect(JSON.stringify([...res.headers.entries()])).not.toContain("tok-123");
  });

  it.each([403, 503])("repassa erro %s do backend como JSON antes do stream", async (status) => {
    mockFetch.mockResolvedValue({
      status,
      ok: false,
      body: null,
      json: vi.fn().mockResolvedValue({ code: "X", message: "no" }),
    });
    const res = await GET(req());
    expect(res.status).toBe(status);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("falha de rede → 503 (indisponível), não 200", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await GET(req());
    expect(res.status).toBe(503);
  });
});
