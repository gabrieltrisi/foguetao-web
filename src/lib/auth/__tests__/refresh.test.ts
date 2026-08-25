import { describe, it, expect, beforeEach, vi } from "vitest";
import { dedupedRefresh, __resetRefreshDedup } from "@/lib/auth/refresh";

const tokens = { accessToken: "new-at", refreshToken: "new-rt", tokenType: "Bearer" };

describe("dedupedRefresh (single-flight)", () => {
  beforeEach(() => __resetRefreshDedup());

  it("chamadas concorrentes com o mesmo refresh token compartilham UMA chamada", async () => {
    let calls = 0;
    const refreshFn = vi.fn(async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 10));
      return tokens;
    });

    const [a, b, c] = await Promise.all([
      dedupedRefresh("rt-1", refreshFn),
      dedupedRefresh("rt-1", refreshFn),
      dedupedRefresh("rt-1", refreshFn),
    ]);

    expect(calls).toBe(1);
    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(a).toEqual(tokens);
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it("após concluir, uma nova chamada dispara um novo refresh", async () => {
    const refreshFn = vi.fn(async () => tokens);
    await dedupedRefresh("rt-1", refreshFn);
    await dedupedRefresh("rt-1", refreshFn);
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it("tokens diferentes não compartilham a mesma chamada", async () => {
    const refreshFn = vi.fn(async () => tokens);
    await Promise.all([dedupedRefresh("rt-1", refreshFn), dedupedRefresh("rt-2", refreshFn)]);
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });

  it("falha no refresh limpa o in-flight (permite nova tentativa)", async () => {
    const failing = vi.fn(async () => {
      throw new Error("refresh boom");
    });
    await expect(dedupedRefresh("rt-1", failing)).rejects.toThrow("refresh boom");
    // não deve reutilizar a promise rejeitada
    await expect(dedupedRefresh("rt-1", failing)).rejects.toThrow("refresh boom");
    expect(failing).toHaveBeenCalledTimes(2);
  });
});
