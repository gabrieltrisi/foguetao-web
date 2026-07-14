import { describe, it, expect } from "vitest";
import {
  ApiError,
  isApiError,
  apiErrorFromResponse,
  unavailableError,
  ErrorCode,
} from "@/types/api/error";

describe("ApiError", () => {
  it("flags de status", () => {
    expect(new ApiError({ statusCode: 401, code: "UNAUTHORIZED", message: "x" }).isUnauthorized).toBe(true);
    expect(new ApiError({ statusCode: 403, code: "FORBIDDEN", message: "x" }).isForbidden).toBe(true);
    expect(new ApiError({ statusCode: 503, code: "SERVICE_UNAVAILABLE", message: "x" }).isUnavailable).toBe(true);
    expect(new ApiError({ statusCode: 0, code: "SERVICE_UNAVAILABLE", message: "x" }).isUnavailable).toBe(true);
  });

  it("isApiError identifica instâncias", () => {
    expect(isApiError(new ApiError({ statusCode: 500, code: "INTERNAL_ERROR", message: "x" }))).toBe(true);
    expect(isApiError(new Error("x"))).toBe(false);
  });

  it("apiErrorFromResponse parseia o formato estável do backend", () => {
    const err = apiErrorFromResponse(403, {
      statusCode: 403,
      code: ErrorCode.COMPANY_ACCESS_DENIED,
      message: "Acesso negado à empresa",
      details: [],
      requestId: "req-1",
    });
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("COMPANY_ACCESS_DENIED");
    expect(err.isForbidden).toBe(true);
    expect(err.requestId).toBe("req-1");
  });

  it("apiErrorFromResponse tolera corpo inesperado", () => {
    const err = apiErrorFromResponse(401, "not json");
    expect(err.statusCode).toBe(401);
    expect(err.isUnauthorized).toBe(true);
  });

  it("unavailableError cria erro de indisponibilidade", () => {
    const err = unavailableError();
    expect(err.statusCode).toBe(0);
    expect(err.isUnavailable).toBe(true);
  });
});
