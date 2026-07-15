import { describe, it, expect } from "vitest";
import {
  ROLE_RANK,
  ROLES_BY_RANK,
  canManageTargetRole,
  canAssignRole,
  assignableRoles,
  isLastActiveOwner,
  memberAbilities,
  invitationStatus,
  invitationStatusMeta,
  isRevocable,
  roleLabel,
  memberStatusMeta,
  formatDate,
  messageForTeamError,
} from "@/lib/company/team";
import {
  companyRoleSchema,
  membershipStatusSchema,
  invitationSchema,
  invitationListSchema,
  memberSchema,
  memberListSchema,
  createInvitationResultSchema,
  patchableMemberStatus,
} from "@/types/api/company";
import { ApiError } from "@/types/api/error";
import type { ApiMember, CompanyRole } from "@/types/api/company";

function member(over: Partial<ApiMember> = {}): ApiMember {
  return {
    id: "m1",
    userId: "u1",
    user: { id: "u1", name: "Fulano", email: "fulano@ex.com" },
    role: "VIEWER",
    status: "ACTIVE",
    joinedAt: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

const invitation = (over: Record<string, unknown> = {}) => ({
  id: "i1",
  companyId: "co-1",
  email: "novo@ex.com",
  role: "VIEWER" as CompanyRole,
  expiresAt: "2026-08-01T00:00:00.000Z",
  acceptedAt: null,
  revokedAt: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  ...over,
});

describe("schemas (contrato real)", () => {
  it("aceita o membro como o backend devolve", () => {
    expect(memberSchema.parse(member())).toMatchObject({ id: "m1" });
  });

  it("a paginação NÃO tem totalPages (contrato desta rota)", () => {
    const parsed = memberListSchema.parse({ items: [member()], total: 1, page: 1, limit: 20 });
    expect(parsed).not.toHaveProperty("totalPages");
    expect(parsed.total).toBe(1);
  });

  it("rejeita papel e status fora do enum", () => {
    expect(memberSchema.safeParse(member({ role: "GOD" as CompanyRole })).success).toBe(false);
    expect(membershipStatusSchema.safeParse("PAUSED").success).toBe(false);
  });

  it("convite não expõe tokenHash e aceita nulos reais", () => {
    const parsed = invitationSchema.parse(invitation());
    expect(parsed).not.toHaveProperty("tokenHash");
    expect(parsed.acceptedAt).toBeNull();
    expect(invitationListSchema.parse({ items: [invitation()], total: 1, page: 1, limit: 20 }).items)
      .toHaveLength(1);
  });

  it("token do convite é opcional (só vem fora de produção)", () => {
    expect(createInvitationResultSchema.parse({ invitation: invitation() }).token).toBeUndefined();
    expect(
      createInvitationResultSchema.parse({ invitation: invitation(), token: "abc" }).token,
    ).toBe("abc");
  });

  it("PATCH só admite ACTIVE|SUSPENDED", () => {
    expect(patchableMemberStatus).toEqual(["ACTIVE", "SUSPENDED"]);
    expect(patchableMemberStatus).not.toContain("REMOVED");
  });

  it("todo papel e status tem rótulo", () => {
    for (const r of companyRoleSchema.options) expect(roleLabel[r]).toBeTruthy();
    for (const s of membershipStatusSchema.options) expect(memberStatusMeta[s].label).toBeTruthy();
  });
});

describe("hierarquia (espelho de canManageTargetRole)", () => {
  it("OWNER gerencia qualquer um, inclusive outro OWNER", () => {
    for (const r of companyRoleSchema.options) {
      expect(canManageTargetRole("OWNER", r)).toBe(true);
    }
  });

  it("ninguém além de OWNER gerencia um OWNER", () => {
    for (const r of companyRoleSchema.options.filter((r) => r !== "OWNER")) {
      expect(canManageTargetRole(r, "OWNER")).toBe(false);
    }
  });

  it("exige rank ESTRITAMENTE maior: ADMIN não gerencia ADMIN", () => {
    expect(canManageTargetRole("ADMIN", "ADMIN")).toBe(false);
    expect(canManageTargetRole("ADMIN", "MANAGER")).toBe(true);
    expect(canManageTargetRole("MANAGER", "ADMIN")).toBe(false);
  });

  it("papéis de mesmo rank não se gerenciam", () => {
    expect(ROLE_RANK.MARKETING).toBe(ROLE_RANK.COMMERCIAL);
    expect(canManageTargetRole("MARKETING", "COMMERCIAL")).toBe(false);
  });

  it("somente OWNER concede OWNER", () => {
    expect(canAssignRole("OWNER", "OWNER")).toBe(true);
    expect(canAssignRole("ADMIN", "OWNER")).toBe(false);
    expect(canAssignRole("ADMIN", "MANAGER")).toBe(true);
  });

  it("assignableRoles não oferece OWNER a quem não é OWNER", () => {
    expect(assignableRoles("ADMIN")).not.toContain("OWNER");
    expect(assignableRoles("OWNER")).toContain("OWNER");
  });

  it("ROLES_BY_RANK vai do maior ao menor privilégio", () => {
    expect(ROLES_BY_RANK[0]).toBe("OWNER");
    expect(ROLES_BY_RANK[ROLES_BY_RANK.length - 1]).toBe("AFFILIATE");
  });
});

describe("último OWNER", () => {
  const owner = member({ id: "m-o", userId: "u-o", role: "OWNER" });

  it("owner ativo sozinho é o último", () => {
    expect(isLastActiveOwner(owner, [owner, member()])).toBe(true);
  });

  it("com dois owners ativos, nenhum é o último", () => {
    const other = member({ id: "m-o2", userId: "u-o2", role: "OWNER" });
    expect(isLastActiveOwner(owner, [owner, other])).toBe(false);
  });

  it("owner suspenso não conta como owner ativo", () => {
    const suspended = member({ id: "m-o2", userId: "u-o2", role: "OWNER", status: "SUSPENDED" });
    expect(isLastActiveOwner(owner, [owner, suspended])).toBe(true);
    expect(isLastActiveOwner(suspended, [owner, suspended])).toBe(false);
  });

  it("quem não é owner nunca é 'último owner'", () => {
    expect(isLastActiveOwner(member(), [member()])).toBe(false);
  });
});

describe("memberAbilities", () => {
  const base = { actorRole: "OWNER" as CompanyRole, actorUserId: "u-actor", canUpdate: true, canRemove: true };

  it("OWNER gerencia um VIEWER", () => {
    const target = member();
    const a = memberAbilities({ ...base, target, members: [target] });
    expect(a).toMatchObject({
      isSelf: false,
      canChangeRole: true,
      canSuspend: true,
      canRemove: true,
      blockedReason: null,
    });
  });

  it("não permite alterar o PRÓPRIO acesso (o backend recusa com 403)", () => {
    const target = member({ userId: "u-actor" });
    const a = memberAbilities({ ...base, target, members: [target] });
    expect(a.isSelf).toBe(true);
    expect(a.canChangeRole).toBe(false);
    expect(a.canSuspend).toBe(false);
    expect(a.canRemove).toBe(false);
    expect(a.blockedReason).toMatch(/próprio/i);
  });

  it("ADMIN não gerencia OWNER e a UI explica", () => {
    const target = member({ role: "OWNER", userId: "u-o" });
    const a = memberAbilities({ ...base, actorRole: "ADMIN", target, members: [target] });
    expect(a.canChangeRole).toBe(false);
    expect(a.canRemove).toBe(false);
    expect(a.blockedReason).toMatch(/privilégio igual ou superior/i);
  });

  it("último OWNER não pode ser rebaixado, suspenso nem removido", () => {
    const target = member({ role: "OWNER", userId: "u-o" });
    const a = memberAbilities({ ...base, target, members: [target] });
    expect(a.isLastOwner).toBe(true);
    expect(a.canChangeRole).toBe(false);
    expect(a.canSuspend).toBe(false);
    expect(a.canRemove).toBe(false);
    expect(a.blockedReason).toMatch(/ao menos um OWNER/i);
  });

  it("com dois OWNERs, o OWNER volta a ser gerenciável", () => {
    const target = member({ role: "OWNER", userId: "u-o" });
    const other = member({ id: "m2", role: "OWNER", userId: "u-o2" });
    const a = memberAbilities({ ...base, target, members: [target, other] });
    expect(a.canChangeRole).toBe(true);
    expect(a.canRemove).toBe(true);
  });

  it("sem permissão de update/remove, nada é oferecido", () => {
    const target = member();
    const a = memberAbilities({
      ...base,
      canUpdate: false,
      canRemove: false,
      target,
      members: [target],
    });
    expect(a.canChangeRole).toBe(false);
    expect(a.canSuspend).toBe(false);
    expect(a.canRemove).toBe(false);
  });

  it("suspenso oferece reativar, não suspender", () => {
    const target = member({ status: "SUSPENDED" });
    const a = memberAbilities({ ...base, target, members: [target] });
    expect(a.canReactivate).toBe(true);
    expect(a.canSuspend).toBe(false);
  });
});

describe("status de convite (derivado)", () => {
  const now = new Date("2026-07-15T00:00:00.000Z");

  it("pendente quando não aceito, não revogado e dentro do prazo", () => {
    expect(invitationStatus(invitation(), now)).toBe("PENDING");
  });

  it("expirado quando passou de expiresAt", () => {
    expect(invitationStatus(invitation({ expiresAt: "2026-07-01T00:00:00.000Z" }), now)).toBe(
      "EXPIRED",
    );
  });

  it("aceito vence expiração (ordem importa)", () => {
    expect(
      invitationStatus(
        invitation({ acceptedAt: "2026-07-02T00:00:00.000Z", expiresAt: "2026-07-01T00:00:00.000Z" }),
        now,
      ),
    ).toBe("ACCEPTED");
  });

  it("revogado vence expiração, mas perde para aceito", () => {
    expect(
      invitationStatus(
        invitation({ revokedAt: "2026-07-02T00:00:00.000Z", expiresAt: "2026-07-01T00:00:00.000Z" }),
        now,
      ),
    ).toBe("REVOKED");
    expect(
      invitationStatus(
        invitation({ acceptedAt: "2026-07-02T00:00:00.000Z", revokedAt: "2026-07-03T00:00:00.000Z" }),
        now,
      ),
    ).toBe("ACCEPTED");
  });

  it("só convite pendente é revogável", () => {
    expect(isRevocable(invitation(), now)).toBe(true);
    expect(isRevocable(invitation({ acceptedAt: "2026-07-02T00:00:00.000Z" }), now)).toBe(false);
    expect(isRevocable(invitation({ revokedAt: "2026-07-02T00:00:00.000Z" }), now)).toBe(false);
    expect(isRevocable(invitation({ expiresAt: "2026-07-01T00:00:00.000Z" }), now)).toBe(false);
  });

  it("todo status derivado tem rótulo", () => {
    for (const s of ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"] as const) {
      expect(invitationStatusMeta[s].label).toBeTruthy();
    }
  });
});

describe("erros reais (400/403/404/409)", () => {
  const err = (code: string, statusCode: number, message = "msg do backend") =>
    new ApiError({ statusCode, code, message });

  it("409 último OWNER", () => {
    expect(messageForTeamError(err("LAST_OWNER_REQUIRED", 409))).toMatch(/ao menos um OWNER/i);
  });

  it("403 hierarquia insuficiente", () => {
    expect(messageForTeamError(err("INSUFFICIENT_ROLE", 403))).toMatch(/privilégio/i);
  });

  it("403 OWNER_ROLE_RESTRICTED preserva a mensagem do backend (ele reusa o código)", () => {
    // O mesmo código cobre "só OWNER concede OWNER" E "não altere o próprio
    // membership" — só a mensagem distingue, então não a sobrescrevemos.
    expect(
      messageForTeamError(err("OWNER_ROLE_RESTRICTED", 403, "Você não pode alterar o seu próprio membership")),
    ).toBe("Você não pode alterar o seu próprio membership");
  });

  it("409 e-mail já é membro", () => {
    expect(messageForTeamError(err("MEMBERSHIP_ALREADY_EXISTS", 409))).toMatch(/já é membro/i);
  });

  it("404 membro/convite não encontrado", () => {
    expect(messageForTeamError(err("MEMBERSHIP_NOT_FOUND", 404))).toMatch(/não encontrado/i);
    expect(messageForTeamError(err("INVITATION_NOT_FOUND", 404))).toMatch(/não encontrado/i);
  });

  it("400 convite expirado, revogado e já usado", () => {
    expect(messageForTeamError(err("INVITATION_EXPIRED", 400))).toMatch(/expirou/i);
    expect(messageForTeamError(err("INVITATION_REVOKED", 400))).toMatch(/revogado/i);
    expect(messageForTeamError(err("INVITATION_ALREADY_USED", 409))).toMatch(/já foi aceito/i);
  });

  it("403 convite de outro e-mail", () => {
    expect(messageForTeamError(err("INVITATION_EMAIL_MISMATCH", 403))).toMatch(/outro e-mail/i);
  });

  it("backend indisponível", () => {
    expect(messageForTeamError(err("SERVICE_UNAVAILABLE", 0))).toMatch(/indisponível/i);
  });

  it("código desconhecido preserva a mensagem do backend", () => {
    expect(messageForTeamError(err("ALGO_NOVO", 400))).toBe("msg do backend");
  });

  it("erro não-API tem fallback e não vaza detalhe interno", () => {
    expect(messageForTeamError(new Error("at Object.<anonymous>"))).toBe(
      "Não foi possível concluir a ação.",
    );
  });
});

describe("formatação", () => {
  it("data nula vira travessão", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("lixo")).toBe("—");
    expect(formatDate("2026-07-14T12:00:00.000Z")).not.toBe("—");
  });
});
