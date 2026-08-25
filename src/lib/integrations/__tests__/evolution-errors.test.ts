import { describe, expect, it } from "vitest";
import { evolutionErrorMessage } from "@/lib/integrations/evolution-errors";
import { ApiError } from "@/types/api/error";

function apiError(code: string, message: string) {
  return new ApiError({ statusCode: 400, code: code as never, message });
}

describe("evolutionErrorMessage", () => {
  it("traduz códigos conhecidos para texto amigável", () => {
    expect(evolutionErrorMessage(apiError("EVOLUTION_HOST_NOT_ALLOWED", "raw"))).toMatch(
      /hosts permitidos/i,
    );
    expect(evolutionErrorMessage(apiError("RATE_LIMITED", "raw"))).toMatch(/muitas tentativas/i);
  });

  it("NUNCA vaza o message cru do backend para códigos desconhecidos", () => {
    const secretish = "apiKey=sk_live_deadbeef leaked in message";
    const out = evolutionErrorMessage(apiError("SOME_UNKNOWN_CODE", secretish));
    expect(out).not.toContain("sk_live_deadbeef");
    expect(out).not.toContain(secretish);
    expect(out).toBe("Algo deu errado. Tente novamente.");
  });

  it("usa o fallback para erros não-ApiError (sem stack/objeto cru)", () => {
    expect(evolutionErrorMessage(new Error("boom"))).toBe("Algo deu errado. Tente novamente.");
    expect(evolutionErrorMessage("string solta", "custom")).toBe("custom");
    expect(evolutionErrorMessage(undefined)).toBe("Algo deu errado. Tente novamente.");
  });
});
