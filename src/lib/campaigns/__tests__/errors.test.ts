import { describe, expect, it } from "vitest";
import { ApiError } from "@/types/api/error";
import { messageForCampaignError } from "@/lib/campaigns/errors";

function apiError(over: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) {
  return new ApiError({
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "erro",
    details: [],
    ...over,
  });
}

describe("messageForCampaignError", () => {
  it("transição inválida (VALIDATION_ERROR) → mensagem do backend", () => {
    const msg = messageForCampaignError(apiError({ message: "Transição inválida para SENDING" }));
    expect(msg).toBe("Transição inválida para SENDING");
  });
  it("409 → conflito de estado amigável", () => {
    const msg = messageForCampaignError(apiError({ code: "CONFLICT", statusCode: 409 }));
    expect(msg).toMatch(/mudou de estado/i);
  });
  it("403 → sem permissão", () => {
    const msg = messageForCampaignError(apiError({ code: "FORBIDDEN", statusCode: 403 }));
    expect(msg).toMatch(/permissão/i);
  });
  it("429 → rate limit amigável", () => {
    expect(messageForCampaignError(apiError({ code: "X", statusCode: 429 }))).toMatch(/tentativas/i);
  });
  it("conta desconectada → mensagem específica", () => {
    const msg = messageForCampaignError(apiError({ code: "MESSAGING_ACCOUNT_INACTIVE" }));
    expect(msg).toMatch(/não está conectada/i);
  });
  it("erro não-API → fallback genérico (nunca vaza técnico)", () => {
    expect(messageForCampaignError(new Error("boom"))).toBe("Não foi possível concluir a ação.");
  });
});
