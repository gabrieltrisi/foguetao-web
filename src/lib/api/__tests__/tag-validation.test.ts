import { describe, it, expect } from "vitest";
import { parseTagListQuery, parseCreateTagBody, parseUpdateTagBody } from "@/lib/api/validation";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

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

describe("parseTagListQuery (BFF)", () => {
  it("aceita os filtros reais de GET /tags", () => {
    expect(
      parseTagListQuery({ page: "2", limit: "50", search: "vip", sortBy: "name", sortOrder: "asc" }),
    ).toMatchObject({ page: 2, limit: 50, search: "vip", sortBy: "name", sortOrder: "asc" });
  });

  it("vazio é válido (todos os filtros são opcionais)", () => {
    expect(parseTagListQuery({})).toEqual({});
  });

  it("rejeita limit acima do teto do backend", () => {
    expectValidationError(() => parseTagListQuery({ limit: "1000" }));
  });

  it("rejeita sortBy fora da allowlist (só createdAt|name)", () => {
    expectValidationError(() => parseTagListQuery({ sortBy: "color" }));
  });
});

describe("parseCreateTagBody (espelha CreateTagDto)", () => {
  it("aceita apenas nome (color e description são opcionais)", () => {
    expect(parseCreateTagBody({ name: "VIP" })).toEqual({ name: "VIP" });
  });

  it("aceita HEX de 3 e de 6 dígitos", () => {
    expect(parseCreateTagBody({ name: "A", color: "#F80" }).color).toBe("#F80");
    expect(parseCreateTagBody({ name: "A", color: "#FF8800" }).color).toBe("#FF8800");
  });

  it("exige nome", () => {
    expectValidationError(() => parseCreateTagBody({}));
    expectValidationError(() => parseCreateTagBody({ name: "" }));
  });

  it("rejeita nome acima de 80 caracteres", () => {
    expectValidationError(() => parseCreateTagBody({ name: "a".repeat(81) }));
  });

  it("rejeita cor que não é HEX", () => {
    expectValidationError(() => parseCreateTagBody({ name: "A", color: "vermelho" }));
    expectValidationError(() => parseCreateTagBody({ name: "A", color: "#GGG" }));
  });

  it("rejeita descrição acima de 255 caracteres", () => {
    expectValidationError(() => parseCreateTagBody({ name: "A", description: "x".repeat(256) }));
  });
});

describe("parseUpdateTagBody (PartialType do CreateTagDto)", () => {
  it("aceita atualização parcial", () => {
    expect(parseUpdateTagBody({ name: "Novo" })).toEqual({ name: "Novo" });
    expect(parseUpdateTagBody({ color: "#000" })).toEqual({ color: "#000" });
  });

  it("rejeita corpo vazio (nada a atualizar)", () => {
    expectValidationError(() => parseUpdateTagBody({}));
  });

  it("aplica as mesmas regras do create", () => {
    expectValidationError(() => parseUpdateTagBody({ color: "azul" }));
    expectValidationError(() => parseUpdateTagBody({ name: "a".repeat(81) }));
  });
});

describe("query keys de tags", () => {
  it("lista de associação e lista de gestão têm chaves distintas", () => {
    expect(queryKeys.crm.tags()).toEqual(["crm", "tags", {}]);
    expect(queryKeys.crm.tags({ page: 2 })).toEqual(["crm", "tags", { page: 2 }]);
    expect(queryKeys.crm.tag("t1")).toEqual(["crm", "tag", "t1"]);
  });

  it("o prefixo de invalidação cobre TODAS as listas de tags", () => {
    expect(crmInvalidation.allTags).toEqual(["crm", "tags"]);
    // ambas as chaves começam com o prefixo → uma invalidação atinge as duas
    for (const key of [queryKeys.crm.tags(), queryKeys.crm.tags({ search: "x" })]) {
      expect(key.slice(0, 2)).toEqual(crmInvalidation.allTags);
    }
  });
});
