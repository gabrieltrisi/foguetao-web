import { describe, it, expect } from "vitest";
import {
  roleTone,
  makePermissionChecker,
  grantedCountInGroup,
  filterCatalog,
  diffRoles,
  hierarchyMatchesBackend,
  messageForRbacError,
} from "@/lib/company/rbac";
import { canManageTargetRole } from "@/lib/company/team";
import {
  roleSchema,
  rolesResponseSchema,
  permissionSchema,
  permissionCatalogSchema,
} from "@/types/api/rbac";
import { companyRoleSchema } from "@/types/api/company";
import { ApiError } from "@/types/api/error";
import type { ApiRole, ApiPermissionCatalog } from "@/types/api/rbac";

function role(over: Partial<ApiRole> = {}): ApiRole {
  return {
    role: "MANAGER",
    name: "Gerente",
    description: "desc",
    permissions: ["company.read", "crm.contacts.read", "crm.contacts.create"],
    permissionCount: 3,
    rank: 60,
    system: true,
    managedBy: ["OWNER", "ADMIN"],
    canManage: ["MARKETING", "VIEWER"],
    ...over,
  };
}

const catalog: ApiPermissionCatalog = {
  total: 4,
  groups: [
    {
      key: "company",
      name: "Empresa",
      permissions: [{ key: "company.read", name: "Visualizar empresa", actions: ["read"] }],
    },
    {
      key: "crm",
      name: "CRM",
      permissions: [
        { key: "crm.contacts.read", name: "Visualizar · Contatos", actions: ["read"] },
        { key: "crm.contacts.create", name: "Criar · Contatos", actions: ["create"] },
        { key: "crm.deals.delete", name: "Excluir · Oportunidades", actions: ["delete"] },
      ],
    },
  ],
};

describe("schemas (contrato real)", () => {
  it("aceita o RoleResponseDto", () => {
    expect(roleSchema.parse(role())).toMatchObject({ role: "MANAGER", system: true });
    expect(rolesResponseSchema.parse({ items: [role()] }).items).toHaveLength(1);
  });

  it("rejeita papel fora do enum", () => {
    expect(roleSchema.safeParse(role({ role: "GOD" as ApiRole["role"] })).success).toBe(false);
  });

  it("aceita o catálogo agrupado", () => {
    expect(permissionCatalogSchema.parse(catalog).total).toBe(4);
    expect(permissionSchema.parse({ key: "x.y", name: "N", actions: ["y"] })).toMatchObject({
      key: "x.y",
    });
  });

  it("todo papel do enum tem um tom visual", () => {
    for (const r of companyRoleSchema.options) expect(roleTone[r]).toBeTruthy();
  });
});

describe("makePermissionChecker (a fonte é a lista do backend)", () => {
  it("concede exatamente o que o papel traz", () => {
    const has = makePermissionChecker(role());
    expect(has("company.read")).toBe(true);
    expect(has("crm.contacts.create")).toBe(true);
    expect(has("crm.deals.delete")).toBe(false);
  });

  it("VIEWER só concede leitura", () => {
    const viewer = role({ role: "VIEWER", permissions: ["company.read", "crm.contacts.read"] });
    const has = makePermissionChecker(viewer);
    expect(has("crm.contacts.read")).toBe(true);
    expect(has("crm.contacts.create")).toBe(false);
  });
});

describe("grantedCountInGroup", () => {
  it("conta só as concedidas do grupo", () => {
    const keys = ["crm.contacts.read", "crm.contacts.create", "crm.deals.delete"];
    expect(grantedCountInGroup(role(), keys)).toBe(2);
    expect(grantedCountInGroup(role({ permissions: [] }), keys)).toBe(0);
  });
});

describe("filterCatalog", () => {
  it("filtra por domínio", () => {
    const groups = filterCatalog(catalog, { domain: "crm" });
    expect(groups.map((g) => g.key)).toEqual(["crm"]);
  });

  it("busca por chave e por nome, sem diferenciar caixa", () => {
    expect(filterCatalog(catalog, { search: "contacts" }).flatMap((g) => g.permissions)).toHaveLength(2);
    expect(filterCatalog(catalog, { search: "EMPRESA" }).flatMap((g) => g.permissions)).toHaveLength(1);
  });

  it("descarta grupos que ficam vazios", () => {
    expect(filterCatalog(catalog, { search: "zzz-nao-existe" })).toEqual([]);
  });

  it("sem filtros devolve tudo", () => {
    const groups = filterCatalog(catalog, {});
    expect(groups.flatMap((g) => g.permissions)).toHaveLength(4);
  });
});

describe("diffRoles (comparação)", () => {
  it("separa exclusivas e comuns", () => {
    const a = role({ permissions: ["company.read", "crm.contacts.read"] });
    const b = role({ permissions: ["crm.contacts.read", "billing.read"] });
    const { onlyA, onlyB, shared } = diffRoles(a, b);
    expect(onlyA).toEqual(["company.read"]);
    expect(onlyB).toEqual(["billing.read"]);
    expect(shared).toEqual(["crm.contacts.read"]);
  });
});

describe("hierarquia: espelho local × backend", () => {
  // Reconstrói o cenário real do backend (managedBy/canManage) e verifica que o
  // espelho local `canManageTargetRole` concorda. Se divergir, FALHA — o teste
  // não mascara a divergência. O backend é a autoridade final.
  const backendRoles: ApiRole[] = [
    role({ role: "OWNER", rank: 100, managedBy: [], canManage: ["ADMIN", "MANAGER", "MARKETING", "COMMERCIAL", "SUPPORT", "FINANCIAL", "AFFILIATE", "VIEWER"] }),
    role({ role: "ADMIN", rank: 80, managedBy: ["OWNER"], canManage: ["MANAGER", "MARKETING", "COMMERCIAL", "SUPPORT", "FINANCIAL", "AFFILIATE", "VIEWER"] }),
    role({ role: "MANAGER", rank: 60, managedBy: ["OWNER", "ADMIN"], canManage: ["MARKETING", "COMMERCIAL", "SUPPORT", "FINANCIAL", "AFFILIATE", "VIEWER"] }),
    role({ role: "MARKETING", rank: 40, managedBy: ["OWNER", "ADMIN", "MANAGER"], canManage: ["AFFILIATE", "VIEWER"] }),
    role({ role: "COMMERCIAL", rank: 40, managedBy: ["OWNER", "ADMIN", "MANAGER"], canManage: ["AFFILIATE", "VIEWER"] }),
    role({ role: "SUPPORT", rank: 40, managedBy: ["OWNER", "ADMIN", "MANAGER"], canManage: ["AFFILIATE", "VIEWER"] }),
    role({ role: "FINANCIAL", rank: 40, managedBy: ["OWNER", "ADMIN", "MANAGER"], canManage: ["AFFILIATE", "VIEWER"] }),
    role({ role: "VIEWER", rank: 20, managedBy: ["OWNER", "ADMIN", "MANAGER", "MARKETING", "COMMERCIAL", "SUPPORT", "FINANCIAL"], canManage: ["AFFILIATE"] }),
    role({ role: "AFFILIATE", rank: 10, managedBy: ["OWNER", "ADMIN", "MANAGER", "MARKETING", "COMMERCIAL", "SUPPORT", "FINANCIAL", "VIEWER"], canManage: [] }),
  ];

  it("o espelho local concorda com o backend em todos os pares", () => {
    expect(hierarchyMatchesBackend(backendRoles, canManageTargetRole)).toBe(true);
  });

  it("detecta divergência (não mascara)", () => {
    const tampered = backendRoles.map((r) =>
      r.role === "ADMIN" ? role({ ...r, canManage: [...r.canManage, "OWNER"] }) : r,
    );
    expect(hierarchyMatchesBackend(tampered, canManageTargetRole)).toBe(false);
  });
});

describe("erros de RBAC", () => {
  const err = (code: string, statusCode: number, message = "msg do backend") =>
    new ApiError({ statusCode, code, message });

  it("403 sem permissão", () => {
    expect(messageForRbacError(err("INSUFFICIENT_PERMISSION", 403))).toMatch(/não tem permissão/i);
    expect(messageForRbacError(err("INSUFFICIENT_ROLE", 403))).toMatch(/não tem permissão/i);
  });

  it("400 sem contexto de empresa", () => {
    expect(messageForRbacError(err("COMPANY_CONTEXT_REQUIRED", 400))).toMatch(/empresa ativa/i);
  });

  it("backend indisponível", () => {
    expect(messageForRbacError(err("SERVICE_UNAVAILABLE", 0))).toMatch(/indisponível/i);
  });

  it("código desconhecido preserva a mensagem", () => {
    expect(messageForRbacError(err("ALGO_NOVO", 400))).toBe("msg do backend");
  });

  it("erro não-API não vaza stack", () => {
    expect(messageForRbacError(new Error("at Object.<anonymous>"))).toBe(
      "Não foi possível carregar papéis e permissões.",
    );
  });
});
