import { describe, expect, it } from "vitest";
import { ApiError } from "@/types/api/error";
import {
  isConflictError,
  toUserError,
  toUserErrorMessage,
} from "@/lib/api/user-error-message";

function err(over: Partial<ConstructorParameters<typeof ApiError>[0]>) {
  return new ApiError({ statusCode: 500, code: "INTERNAL_ERROR", message: "raw", ...over });
}

describe("toUserError (§17)", () => {
  it("nunca vaza a mensagem técnica bruta", () => {
    const u = toUserError(err({ statusCode: 500, message: "TypeError: x is undefined" }));
    expect(u.message).not.toContain("TypeError");
    expect(u.title).toBe("Erro no servidor");
  });

  it("preserva requestId para suporte", () => {
    const u = toUserError(err({ statusCode: 422, requestId: "req-123" }));
    expect(u.requestId).toBe("req-123");
    expect(toUserErrorMessage(err({ statusCode: 422, requestId: "req-123" }))).toContain("req-123");
  });

  it("mapeia status conhecidos", () => {
    expect(toUserError(err({ statusCode: 401 })).title).toBe("Sessão expirada");
    expect(toUserError(err({ statusCode: 403 })).title).toBe("Sem permissão");
    expect(toUserError(err({ statusCode: 404 })).title).toBe("Não encontrado");
    expect(toUserError(err({ statusCode: 429 })).retryable).toBe(true);
    expect(toUserError(err({ statusCode: 0, code: "SERVICE_UNAVAILABLE" })).retryable).toBe(true);
  });

  it("conflito de versão/rascunho → mensagem específica + isConflict", () => {
    const v = toUserError(err({ statusCode: 409, code: "CONVERSATION_VERSION_CONFLICT" }));
    expect(v.isConflict).toBe(true);
    expect(v.message).toContain("alterada por outra pessoa");
    const d = err({ statusCode: 409, code: "CONVERSATION_DRAFT_CONFLICT" });
    expect(isConflictError(d)).toBe(true);
    expect(toUserError(d).message).toContain("outra aba");
  });

  it("erro desconhecido (não-ApiError) → genérico retryable", () => {
    const u = toUserError(new Error("boom"));
    expect(u.message).toContain("inesperado");
    expect(u.retryable).toBe(true);
    expect(isConflictError(new Error("boom"))).toBe(false);
  });
});
