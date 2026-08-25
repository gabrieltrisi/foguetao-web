import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { captureTracking } from "./utm";

beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("captureTracking", () => {
  it("coleta apenas parâmetros utm_* presentes na URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=lp1&foo=bar",
    );
    const { utm } = captureTracking();
    expect(utm).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "lp1",
    });
    expect(utm).not.toHaveProperty("foo");
  });

  it("retorna utm vazio quando não há parâmetros", () => {
    const { utm } = captureTracking();
    expect(utm).toEqual({});
  });

  it("expõe o referrer (string, possivelmente vazia)", () => {
    expect(typeof captureTracking().referrer).toBe("string");
  });
});
