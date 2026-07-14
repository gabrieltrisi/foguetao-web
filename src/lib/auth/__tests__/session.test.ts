import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/types/api/error";

// Mock dos cookies (server) e do refresh deduplicado.
const cookieState = {
  access: null as string | null,
  refresh: null as string | null,
  company: null as string | null,
};

vi.mock("@/lib/auth/cookies", () => ({
  getAccessToken: vi.fn(async () => cookieState.access),
  getRefreshToken: vi.fn(async () => cookieState.refresh),
  getActiveCompanyId: vi.fn(async () => cookieState.company),
  setSessionCookies: vi.fn(async (t: { accessToken: string; refreshToken: string }) => {
    cookieState.access = t.accessToken;
    cookieState.refresh = t.refreshToken;
  }),
  clearSessionCookies: vi.fn(async () => {
    cookieState.access = null;
    cookieState.refresh = null;
    cookieState.company = null;
  }),
}));

const dedupedRefresh = vi.fn();
vi.mock("@/lib/auth/refresh", () => ({ dedupedRefresh: (rt: string) => dedupedRefresh(rt) }));

import { withAuth, SessionExpiredError } from "@/lib/auth/session";
import { clearSessionCookies } from "@/lib/auth/cookies";

describe("withAuth", () => {
  beforeEach(() => {
    cookieState.access = null;
    cookieState.refresh = null;
    cookieState.company = null;
    dedupedRefresh.mockReset();
    vi.mocked(clearSessionCookies).mockClear();
  });

  it("sem tokens → SessionExpiredError", async () => {
    await expect(withAuth(async () => "ok")).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it("sucesso na primeira tentativa e propaga a empresa ativa (X-Company-Id)", async () => {
    cookieState.access = "at-1";
    cookieState.company = "cid-9";
    const fn = vi.fn(async (ctx: { token: string; companyId: string | null }) => {
      expect(ctx.token).toBe("at-1");
      expect(ctx.companyId).toBe("cid-9");
      return "data";
    });
    await expect(withAuth(fn)).resolves.toBe("data");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(dedupedRefresh).not.toHaveBeenCalled();
  });

  it("401 → faz UM refresh, atualiza cookies e tenta novamente", async () => {
    cookieState.access = "at-old";
    cookieState.refresh = "rt-old";
    dedupedRefresh.mockResolvedValue({ accessToken: "at-new", refreshToken: "rt-new" });

    let call = 0;
    const fn = vi.fn(async (ctx: { token: string }) => {
      call += 1;
      if (call === 1) throw new ApiError({ statusCode: 401, code: "UNAUTHORIZED", message: "expired" });
      expect(ctx.token).toBe("at-new");
      return "recovered";
    });

    await expect(withAuth(fn)).resolves.toBe("recovered");
    expect(dedupedRefresh).toHaveBeenCalledTimes(1);
    expect(dedupedRefresh).toHaveBeenCalledWith("rt-old");
    expect(cookieState.access).toBe("at-new");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("refresh falho → limpa a sessão e lança SessionExpiredError", async () => {
    cookieState.access = "at-old";
    cookieState.refresh = "rt-old";
    dedupedRefresh.mockRejectedValue(new Error("invalid refresh"));

    const fn = vi.fn(async () => {
      throw new ApiError({ statusCode: 401, code: "UNAUTHORIZED", message: "expired" });
    });

    await expect(withAuth(fn)).rejects.toBeInstanceOf(SessionExpiredError);
    expect(clearSessionCookies).toHaveBeenCalledTimes(1);
    expect(cookieState.access).toBeNull();
  });

  it("erro não-401 é propagado sem refresh", async () => {
    cookieState.access = "at-1";
    cookieState.refresh = "rt-1";
    const fn = vi.fn(async () => {
      throw new ApiError({ statusCode: 500, code: "INTERNAL_ERROR", message: "boom" });
    });
    await expect(withAuth(fn)).rejects.toMatchObject({ statusCode: 500 });
    expect(dedupedRefresh).not.toHaveBeenCalled();
  });
});
