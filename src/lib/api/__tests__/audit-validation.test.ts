import { describe, it, expect } from "vitest";
import { parseAuditListQuery, requireUuid } from "@/lib/api/validation";
import { queryKeys } from "@/lib/query/keys";
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

describe("parseAuditListQuery (BFF)", () => {
  it("aceita e coage os filtros reais de GET /audit", () => {
    const q = parseAuditListQuery({
      page: "2",
      limit: "50",
      action: "COMPANY_MEMBER_REMOVED",
      entity: "company_member",
      userId: UUID,
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-15T00:00:00.000Z",
      search: "req-1",
      sortOrder: "asc",
    });
    expect(q).toMatchObject({ page: 2, limit: 50, action: "COMPANY_MEMBER_REMOVED", sortOrder: "asc" });
  });

  it("vazio é válido (todos os filtros são opcionais)", () => {
    expect(parseAuditListQuery({})).toEqual({});
  });

  it("rejeita limit acima do teto", () => {
    expectValidationError(() => parseAuditListQuery({ limit: "1000" }));
  });

  it("rejeita userId que não é UUID", () => {
    expectValidationError(() => parseAuditListQuery({ userId: "nao-uuid" }));
  });

  it("rejeita sortOrder fora do enum", () => {
    expectValidationError(() => parseAuditListQuery({ sortOrder: "cima" }));
  });

  it("rejeita datas sem offset", () => {
    expectValidationError(() => parseAuditListQuery({ from: "2026-07-01" }));
  });

  it("requireUuid protege a rota de detalhe", () => {
    expect(requireUuid(UUID, "id")).toBe(UUID);
    expectValidationError(() => requireUuid("x", "id"));
  });
});

describe("query keys de auditoria", () => {
  it("a lista varia por filtros e o detalhe por id", () => {
    expect(queryKeys.company.audit({ page: 1 })).toEqual(["company", "audit", { page: 1 }]);
    expect(queryKeys.company.audit()).toEqual(["company", "audit", {}]);
    expect(queryKeys.company.auditEntry("a1")).toEqual(["company", "audit", "entry", "a1"]);
  });
});
