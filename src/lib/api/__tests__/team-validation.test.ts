import { describe, it, expect } from "vitest";
import {
  requireUuid,
  requireInviteToken,
  parseMemberListQuery,
  parseInvitationListQuery,
  parseUpdateMemberBody,
  parseCreateInvitationBody,
} from "@/lib/api/validation";
import { queryKeys, companyInvalidation, crmInvalidation, integrationsInvalidation } from "@/lib/query/keys";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const TOKEN = "a".repeat(64);

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

describe("ids de rota", () => {
  it("memberId/invitationId exigem UUID", () => {
    expect(requireUuid(UUID, "memberId")).toBe(UUID);
    expectValidationError(() => requireUuid("usr-1", "memberId"));
    expectValidationError(() => requireUuid("../../companies", "invitationId"));
  });
});

describe("requireInviteToken", () => {
  it("aceita o formato real (64 hex)", () => {
    expect(requireInviteToken(TOKEN)).toBe(TOKEN);
    expect(requireInviteToken("0123456789abcdef".repeat(4))).toHaveLength(64);
  });

  it("rejeita tamanho errado, não-hex, path traversal e tipo errado", () => {
    expectValidationError(() => requireInviteToken("a".repeat(63)));
    expectValidationError(() => requireInviteToken("a".repeat(65)));
    expectValidationError(() => requireInviteToken("A".repeat(64))); // maiúsculas não são o formato
    expectValidationError(() => requireInviteToken("../".repeat(20)));
    expectValidationError(() => requireInviteToken(undefined));
    expectValidationError(() => requireInviteToken(123));
  });
});

describe("parseMemberListQuery", () => {
  it("aceita os filtros reais", () => {
    expect(
      parseMemberListQuery({ page: "2", limit: "20", search: "ana", role: "ADMIN", status: "ACTIVE" }),
    ).toMatchObject({ page: 2, limit: 20, search: "ana", role: "ADMIN", status: "ACTIVE" });
  });

  it("rejeita papel e status fora do enum", () => {
    expectValidationError(() => parseMemberListQuery({ role: "GOD" }));
    expectValidationError(() => parseMemberListQuery({ status: "PAUSED" }));
  });

  it("não aceita sortBy (a rota não ordena por campo)", () => {
    // sortBy é simplesmente descartado — não existe no contrato desta rota.
    expect(parseMemberListQuery({ sortBy: "role", page: "1" })).toEqual({ page: 1 });
  });

  it("busca respeita o teto de 120 chars do backend", () => {
    expect(parseMemberListQuery({ search: "a".repeat(120) })).toEqual({ search: "a".repeat(120) });
    expectValidationError(() => parseMemberListQuery({ search: "a".repeat(121) }));
  });

  it("paginação limitada", () => {
    expectValidationError(() => parseMemberListQuery({ page: "0" }));
    expectValidationError(() => parseMemberListQuery({ limit: "101" }));
    expect(parseMemberListQuery({ limit: "100" })).toEqual({ limit: 100 });
  });

  it("descarta companyId da query (tenant vem da sessão)", () => {
    expect(parseMemberListQuery({ companyId: UUID, page: "1" })).toEqual({ page: 1 });
  });
});

describe("parseInvitationListQuery", () => {
  it("aceita apenas busca + paginação (contrato real)", () => {
    expect(parseInvitationListQuery({ search: "ana@ex.com", page: "1" })).toEqual({
      search: "ana@ex.com",
      page: 1,
    });
  });

  it("status não é filtro no backend — é descartado", () => {
    expect(parseInvitationListQuery({ status: "PENDING" })).toEqual({});
  });
});

describe("parseUpdateMemberBody", () => {
  it("aceita role e/ou status", () => {
    expect(parseUpdateMemberBody({ role: "MANAGER" })).toEqual({ role: "MANAGER" });
    expect(parseUpdateMemberBody({ status: "SUSPENDED" })).toEqual({ status: "SUSPENDED" });
    expect(parseUpdateMemberBody({ role: "VIEWER", status: "ACTIVE" })).toEqual({
      role: "VIEWER",
      status: "ACTIVE",
    });
  });

  it("corpo vazio é rejeitado", () => {
    expectValidationError(() => parseUpdateMemberBody({}));
  });

  it("status REMOVED/INVITED são rejeitados (o backend também rejeita)", () => {
    expectValidationError(() => parseUpdateMemberBody({ status: "REMOVED" }));
    expectValidationError(() => parseUpdateMemberBody({ status: "INVITED" }));
  });

  it("bloqueia campos fora do contrato (userId, companyId, id)", () => {
    expectValidationError(() => parseUpdateMemberBody({ role: "ADMIN", companyId: UUID }));
    expectValidationError(() => parseUpdateMemberBody({ role: "ADMIN", userId: UUID }));
  });

  it("papel inválido é rejeitado", () => {
    expectValidationError(() => parseUpdateMemberBody({ role: "SUPERUSER" }));
  });
});

describe("parseCreateInvitationBody", () => {
  it("aceita e-mail + papel", () => {
    expect(parseCreateInvitationBody({ email: "ana@ex.com", role: "VIEWER" })).toEqual({
      email: "ana@ex.com",
      role: "VIEWER",
    });
  });

  it("e-mail inválido é rejeitado antes do backend", () => {
    expectValidationError(() => parseCreateInvitationBody({ email: "nao-e-email", role: "VIEWER" }));
    expectValidationError(() => parseCreateInvitationBody({ email: "", role: "VIEWER" }));
  });

  it("papel é obrigatório e precisa existir", () => {
    expectValidationError(() => parseCreateInvitationBody({ email: "a@b.com" }));
    expectValidationError(() => parseCreateInvitationBody({ email: "a@b.com", role: "GOD" }));
  });

  it("bloqueia campos extras (ex.: companyId no corpo)", () => {
    expectValidationError(() =>
      parseCreateInvitationBody({ email: "a@b.com", role: "VIEWER", companyId: UUID }),
    );
  });
});

describe("query keys de empresa", () => {
  it("são centralizadas e estáveis", () => {
    expect(queryKeys.company.members({ page: 1 })).toEqual(["company", "members", { page: 1 }]);
    expect(queryKeys.company.member("m1")).toEqual(["company", "member", "m1"]);
    expect(queryKeys.company.invitations({})).toEqual(["company", "invitations", {}]);
  });

  it("prefixos de invalidação alcançam as listas", () => {
    expect(queryKeys.company.members({ page: 3 }).slice(0, 2)).toEqual([
      ...companyInvalidation.allMembers,
    ]);
    expect(queryKeys.company.invitations({ page: 2 }).slice(0, 2)).toEqual([
      ...companyInvalidation.allInvitations,
    ]);
    expect(queryKeys.company.member("m1")).toEqual([...companyInvalidation.member("m1")]);
  });

  it("membros e convites não colidem entre si", () => {
    expect(queryKeys.company.members({}).slice(0, 2)).not.toEqual(
      queryKeys.company.invitations({}).slice(0, 2),
    );
  });

  it("NÃO colidem com CRM nem com integrações", () => {
    expect(companyInvalidation.allMembers[0]).toBe("company");
    for (const other of [
      crmInvalidation.allDeals,
      crmInvalidation.allTasks,
      crmInvalidation.allContacts,
      integrationsInvalidation.allConnections,
    ]) {
      expect(other[0]).not.toBe("company");
    }
  });
});
