import { describe, it, expect } from "vitest";
import {
  actionDomain,
  actionLabel,
  domainMeta,
  entityLabel,
  isFailure,
  outcomeTone,
  messageForAuditError,
  metadataEntries,
  maskIp,
  ACTION_FILTER_OPTIONS,
  ENTITY_FILTER_OPTIONS,
} from "@/lib/company/audit-display";
import { auditLogSchema, auditListSchema } from "@/types/api/audit";
import { ApiError } from "@/types/api/error";
import type { ApiAuditLog } from "@/types/api/audit";

function log(over: Partial<ApiAuditLog> = {}): ApiAuditLog {
  return {
    id: "a1",
    action: "COMPANY_MEMBER_REMOVED",
    entity: "company_member",
    entityId: "u1",
    userId: "actor1",
    actor: { id: "actor1", name: "Ana", email: "ana@x.com" },
    requestId: "req-1",
    ipAddress: "187.63.1.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537",
    metadata: { from: "ADMIN", to: "VIEWER" },
    createdAt: "2026-07-15T12:00:00.000Z",
    ...over,
  };
}

describe("schema de auditoria (contrato real)", () => {
  it("aceita a resposta exata do AuditLogResponseDto", () => {
    expect(auditLogSchema.parse(log())).toMatchObject({ id: "a1", action: "COMPANY_MEMBER_REMOVED" });
  });

  it("actor, entityId, requestId, ip, userAgent e metadata podem ser nulos", () => {
    const parsed = auditLogSchema.parse(
      log({ actor: null, entityId: null, userId: null, requestId: null, ipAddress: null, userAgent: null, metadata: null }),
    );
    expect(parsed.actor).toBeNull();
    expect(parsed.metadata).toBeNull();
  });

  it("NÃO expõe companyId (o DTO do backend não o inclui)", () => {
    const parsed = auditLogSchema.parse(log()) as Record<string, unknown>;
    expect(parsed.companyId).toBeUndefined();
  });

  it("valida o envelope paginado", () => {
    const list = auditListSchema.parse({ items: [log()], total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(list.items).toHaveLength(1);
  });
});

describe("domínio e tom da ação", () => {
  it("classifica prefixos conhecidos", () => {
    expect(actionDomain("LOGIN_SUCCESS")).toBe("auth");
    expect(actionDomain("COMPANY_MEMBER_ADDED")).toBe("member");
    expect(actionDomain("COMPANY_INVITATION_CREATED")).toBe("invitation");
    expect(actionDomain("COMPANY_UPDATED")).toBe("company");
    expect(actionDomain("DEAL_CREATED")).toBe("crm");
    expect(actionDomain("INTEGRATION_SYNC_STARTED")).toBe("integration");
  });

  it("qualquer ação tem meta (fallback determinístico, nunca indefinido)", () => {
    expect(domainMeta("ACAO_NOVA_DESCONHECIDA").label).toBeTruthy();
  });

  it("marca falhas com tom de alerta", () => {
    expect(isFailure("LOGIN_FAILED")).toBe(true);
    expect(outcomeTone("LOGIN_FAILED")).toBe("danger");
    expect(isFailure("LOGIN_SUCCESS")).toBe(false);
    expect(outcomeTone("LOGIN_SUCCESS")).toBe("success");
  });
});

describe("rótulos legíveis", () => {
  it("traduz ações e entidades conhecidas", () => {
    expect(actionLabel("COMPANY_MEMBER_REMOVED")).toBe("Membro removido");
    expect(entityLabel("company_member")).toBe("Membro");
  });

  it("faz title-case de ações/entidades desconhecidas em vez de mostrar cru", () => {
    expect(actionLabel("SOME_NEW_ACTION")).toBe("Some new action");
    expect(entityLabel("weird_thing")).toBe("Weird thing");
  });
});

describe("opções de filtro (valores reais do enum)", () => {
  it("ação e recurso trazem valores enviáveis ao backend", () => {
    expect(ACTION_FILTER_OPTIONS.every((o) => typeof o.value === "string" && o.label)).toBe(true);
    expect(ACTION_FILTER_OPTIONS.some((o) => o.value === "COMPANY_MEMBER_REMOVED")).toBe(true);
    expect(ENTITY_FILTER_OPTIONS.some((o) => o.value === "company_member")).toBe(true);
  });
});

describe("metadata para exibição", () => {
  it("achata pares chave/valor da metadata já sanitizada", () => {
    expect(metadataEntries(log({ metadata: { from: "ADMIN", to: "VIEWER" } }))).toEqual([
      ["from", "ADMIN"],
      ["to", "VIEWER"],
    ]);
  });

  it("metadata nula não quebra", () => {
    expect(metadataEntries(log({ metadata: null }))).toEqual([]);
  });

  it("serializa valores compostos sem estourar", () => {
    const entries = metadataEntries(log({ metadata: { fields: ["name", "email"], obj: { a: 1 } } }));
    expect(entries).toContainEqual(["fields", "name, email"]);
    expect(entries).toContainEqual(["obj", '{"a":1}']);
  });
});

describe("IP mascarado na UI", () => {
  it("nunca devolve o IP completo", () => {
    expect(maskIp("187.63.1.14")).toBe("187.63.•••.•••");
  });
});

describe("mensagens de erro", () => {
  it("mapeia permissão negada", () => {
    const e = new ApiError({ statusCode: 403, code: "INSUFFICIENT_PERMISSION", message: "x" });
    expect(messageForAuditError(e)).toMatch(/permissão/i);
  });

  it("mapeia registro não encontrado", () => {
    const e = new ApiError({ statusCode: 404, code: "NOT_FOUND", message: "x" });
    expect(messageForAuditError(e)).toMatch(/não encontrado/i);
  });

  it("tem fallback para erro desconhecido", () => {
    expect(messageForAuditError(new Error("boom"))).toBeTruthy();
  });
});
