import { describe, it, expect } from "vitest";
import { requireUuid, parseDealActionBody, parseKanbanQuery } from "@/lib/api/validation";
import { buildQuery } from "@/lib/api/query-string";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

function expectValidationError(fn: () => unknown) {
  try {
    fn();
    throw new Error("deveria ter lançado");
  } catch (e) {
    expect(isApiError(e)).toBe(true);
    if (isApiError(e)) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe("VALIDATION_ERROR");
    }
  }
}

describe("requireUuid (ids de rota)", () => {
  it("aceita UUID válido", () => {
    expect(requireUuid(UUID)).toBe(UUID);
  });

  it("rejeita id não-UUID (não chega ao backend)", () => {
    expectValidationError(() => requireUuid("123"));
    expectValidationError(() => requireUuid("../../etc/passwd"));
    expectValidationError(() => requireUuid(""));
  });
});

describe("parseDealActionBody (expectedVersion)", () => {
  it("aceita inteiro >= 1 e preserva os demais campos", () => {
    const body = parseDealActionBody({ expectedVersion: 3, toStageId: UUID });
    expect(body.expectedVersion).toBe(3);
    expect(body.toStageId).toBe(UUID);
  });

  it("rejeita ausente, zero, negativo, fracionário ou string", () => {
    expectValidationError(() => parseDealActionBody({}));
    expectValidationError(() => parseDealActionBody(null));
    expectValidationError(() => parseDealActionBody({ expectedVersion: 0 }));
    expectValidationError(() => parseDealActionBody({ expectedVersion: -1 }));
    expectValidationError(() => parseDealActionBody({ expectedVersion: 1.5 }));
    expectValidationError(() => parseDealActionBody({ expectedVersion: "1" }));
  });
});

describe("parseKanbanQuery (cursor e paginação)", () => {
  it("cursor precisa ser UUID (é o id do último deal)", () => {
    expect(parseKanbanQuery({ cursor: UUID })).toEqual({ cursor: UUID });
    expectValidationError(() => parseKanbanQuery({ cursor: "abc" }));
  });

  it("limit é clampado no máximo do backend (50)", () => {
    expect(parseKanbanQuery({ limit: "20" })).toEqual({ limit: 20 });
    expect(parseKanbanQuery({ limit: "999" })).toEqual({ limit: 50 });
  });

  it("rejeita limit inválido", () => {
    expectValidationError(() => parseKanbanQuery({ limit: "0" }));
    expectValidationError(() => parseKanbanQuery({ limit: "-5" }));
    expectValidationError(() => parseKanbanQuery({ limit: "abc" }));
  });

  it("ignora ausência de parâmetros e cursor vazio", () => {
    expect(parseKanbanQuery({})).toEqual({});
    expect(parseKanbanQuery({ cursor: "" })).toEqual({});
  });
});

describe("buildQuery (fonte única de querystring)", () => {
  it("omite vazios/nulos e serializa escalares", () => {
    expect(buildQuery({ page: 2, limit: 20, search: "ana", empty: "", nulo: null, undef: undefined })).toBe(
      "?page=2&limit=20&search=ana",
    );
  });

  it("arrays viram chaves repetidas; array vazio é omitido", () => {
    expect(buildQuery({ tagIds: ["a", "b"] })).toBe("?tagIds=a&tagIds=b");
    expect(buildQuery({ tagIds: [] })).toBe("");
  });

  it("sem params devolve string vazia", () => {
    expect(buildQuery()).toBe("");
  });
});
