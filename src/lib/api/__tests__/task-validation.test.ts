import { describe, it, expect } from "vitest";
import { requireUuid, parseAssignBody, parseTaskListQuery } from "@/lib/api/validation";
import { buildQuery } from "@/lib/api/query-string";
import { isApiError } from "@/types/api/error";

const UUID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const UUID2 = "9c858901-8a57-4791-81fe-4c455b099bc9";

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

describe("taskId de rota", () => {
  it("aceita UUID e rejeita o resto antes de chamar o backend", () => {
    expect(requireUuid(UUID)).toBe(UUID);
    expectValidationError(() => requireUuid("task-1"));
    expectValidationError(() => requireUuid("../../deals"));
    expectValidationError(() => requireUuid(""));
  });
});

describe("parseAssignBody (POST /tasks/:id/assign)", () => {
  it("aceita assignedToUserId UUID", () => {
    expect(parseAssignBody({ assignedToUserId: UUID })).toEqual({ assignedToUserId: UUID });
  });

  it("rejeita id não-UUID, ausente ou de tipo errado", () => {
    expectValidationError(() => parseAssignBody({ assignedToUserId: "u1" }));
    expectValidationError(() => parseAssignBody({}));
    expectValidationError(() => parseAssignBody({ assignedToUserId: 42 }));
    expectValidationError(() => parseAssignBody(null));
  });

  it("descarta campos extras (não repassa payload inventado)", () => {
    expect(parseAssignBody({ assignedToUserId: UUID, isAdmin: true })).toEqual({ assignedToUserId: UUID });
  });
});

describe("parseTaskListQuery (GET /tasks)", () => {
  it("aceita os filtros reais do ListTasksQueryDto", () => {
    const out = parseTaskListQuery({
      page: "2",
      limit: "20",
      search: "ligar",
      status: "PENDING",
      priority: "HIGH",
      assignedToUserId: UUID,
      dealId: UUID2,
      overdue: "true",
      dueFrom: "2026-07-01T00:00:00.000Z",
      dueTo: "2026-07-31T23:59:59.000Z",
      sortBy: "dueAt",
      sortOrder: "asc",
    });
    expect(out).toMatchObject({ page: 2, limit: 20, status: "PENDING", overdue: "true", sortBy: "dueAt" });
  });

  it("ignora vazios em vez de mandar filtro vazio ao backend", () => {
    expect(parseTaskListQuery({ search: "", status: "" })).toEqual({});
  });

  it("rejeita enums inválidos", () => {
    expectValidationError(() => parseTaskListQuery({ status: "DONE" }));
    expectValidationError(() => parseTaskListQuery({ priority: "CRITICAL" }));
    expectValidationError(() => parseTaskListQuery({ sortOrder: "up" }));
  });

  it("sortBy respeita a allowlist (bloqueia injeção de campo)", () => {
    expect(parseTaskListQuery({ sortBy: "priority" })).toEqual({ sortBy: "priority" });
    expectValidationError(() => parseTaskListQuery({ sortBy: "title" }));
    expectValidationError(() => parseTaskListQuery({ sortBy: "id; DROP TABLE tasks" }));
  });

  it("ids vinculados precisam ser UUID", () => {
    expectValidationError(() => parseTaskListQuery({ assignedToUserId: "u1" }));
    expectValidationError(() => parseTaskListQuery({ dealId: "deal-1" }));
    expectValidationError(() => parseTaskListQuery({ contactId: "x" }));
    expectValidationError(() => parseTaskListQuery({ organizationId: "x" }));
  });

  it("overdue é booleano literal", () => {
    expect(parseTaskListQuery({ overdue: "false" })).toEqual({ overdue: "false" });
    expectValidationError(() => parseTaskListQuery({ overdue: "1" }));
    expectValidationError(() => parseTaskListQuery({ overdue: "sim" }));
  });

  it("datas precisam ser ISO-8601 com offset", () => {
    expectValidationError(() => parseTaskListQuery({ dueFrom: "14/07/2026" }));
    expectValidationError(() => parseTaskListQuery({ dueTo: "2026-07-31" }));
  });

  it("paginação: inteiros >= 1 e limit no teto do backend", () => {
    expectValidationError(() => parseTaskListQuery({ page: "0" }));
    expectValidationError(() => parseTaskListQuery({ page: "-1" }));
    expectValidationError(() => parseTaskListQuery({ page: "abc" }));
    expectValidationError(() => parseTaskListQuery({ limit: "101" }));
    expect(parseTaskListQuery({ limit: "100" })).toEqual({ limit: 100 });
  });

  it("search longo demais é rejeitado", () => {
    expectValidationError(() => parseTaskListQuery({ search: "a".repeat(201) }));
  });

  it("arrays não são aceitos (nenhum filtro de tarefas é múltiplo)", () => {
    expect(parseTaskListQuery({ status: ["PENDING", "COMPLETED"] })).toEqual({});
  });

  it("descarta parâmetros desconhecidos", () => {
    expect(parseTaskListQuery({ companyId: UUID, page: "1" })).toEqual({ page: 1 });
  });
});

describe("buildQuery com filtros de tarefas", () => {
  it("omite undefined e serializa booleano", () => {
    expect(buildQuery({ page: 1, status: undefined, overdue: true })).toBe("?page=1&overdue=true");
  });

  it("sem filtros não gera querystring", () => {
    expect(buildQuery({ page: undefined })).toBe("");
  });

  it("escapa a busca", () => {
    expect(buildQuery({ search: "a&b=c" })).toBe("?search=a%26b%3Dc");
  });
});
