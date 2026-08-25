import { describe, it, expect } from "vitest";
import {
  taskStatusMeta,
  taskPriorityMeta,
  ASSIGNABLE_ROLES,
  isAssignableRole,
  isOpenStatus,
  isOverdue,
  isDueSoon,
  toDateTimeLocal,
  fromDateTimeLocal,
  formatTaskDate,
  messageForTaskError,
} from "@/lib/crm/task-helpers";
import { taskSchema, taskListSchema, taskSortFields, creatableTaskStatus, patchableTaskStatus } from "@/types/api/crm-tasks";
import { ApiError } from "@/types/api/error";
import type { TaskStatus, TaskPriority } from "@/types/api/crm-tasks";

const NOW = new Date("2026-07-14T12:00:00.000Z");

function task(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "t1",
    title: "Ligar para o cliente",
    description: null,
    status: "PENDING" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    assignedToUserId: "u1",
    dealId: null,
    contactId: null,
    organizationId: null,
    dueAt: null,
    reminderAt: null,
    completedAt: null,
    completedByUserId: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...over,
  };
}

describe("schemas (contrato real do TaskResponseDto)", () => {
  it("aceita a resposta do backend", () => {
    expect(taskSchema.parse(task())).toMatchObject({ id: "t1", status: "PENDING" });
  });

  it("assignedToUserId NÃO é nulável", () => {
    expect(taskSchema.safeParse(task({ assignedToUserId: null })).success).toBe(false);
  });

  it("rejeita status/prioridade fora do enum", () => {
    expect(taskSchema.safeParse(task({ status: "DONE" })).success).toBe(false);
    expect(taskSchema.safeParse(task({ priority: "CRITICAL" })).success).toBe(false);
  });

  it("aceita nulos apenas onde o backend permite", () => {
    const parsed = taskSchema.parse(task({ dueAt: null, dealId: null, completedAt: null }));
    expect(parsed.dueAt).toBeNull();
  });

  it("lista paginada expõe page/limit/total/totalPages", () => {
    const parsed = taskListSchema.parse({ items: [task()], total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.totalPages).toBe(1);
  });

  it("status criáveis e patcháveis seguem os DTOs (COMPLETED tem endpoint próprio)", () => {
    expect(creatableTaskStatus).toEqual(["PENDING", "IN_PROGRESS"]);
    expect(patchableTaskStatus).not.toContain("COMPLETED");
    expect(taskSortFields).toEqual(["createdAt", "updatedAt", "dueAt", "priority", "status"]);
  });
});

describe("status visual", () => {
  it("todo status/prioridade tem rótulo e tom", () => {
    (["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"] as TaskStatus[]).forEach((s) => {
      expect(taskStatusMeta[s].label).toBeTruthy();
    });
    (["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]).forEach((p) => {
      expect(taskPriorityMeta[p].label).toBeTruthy();
    });
  });

  it("isOpenStatus reflete a definição do backend", () => {
    expect(isOpenStatus("PENDING")).toBe(true);
    expect(isOpenStatus("IN_PROGRESS")).toBe(true);
    expect(isOpenStatus("COMPLETED")).toBe(false);
    expect(isOpenStatus("CANCELED")).toBe(false);
  });
});

describe("overdue (mesma regra do filtro do backend)", () => {
  it("dueAt no passado e status aberto → atrasada", () => {
    expect(isOverdue({ dueAt: "2026-07-13T12:00:00.000Z", status: "PENDING" }, NOW)).toBe(true);
    expect(isOverdue({ dueAt: "2026-07-13T12:00:00.000Z", status: "IN_PROGRESS" }, NOW)).toBe(true);
  });

  it("concluída/cancelada nunca é atrasada", () => {
    expect(isOverdue({ dueAt: "2026-07-13T12:00:00.000Z", status: "COMPLETED" }, NOW)).toBe(false);
    expect(isOverdue({ dueAt: "2026-07-13T12:00:00.000Z", status: "CANCELED" }, NOW)).toBe(false);
  });

  it("sem prazo não é atrasada", () => {
    expect(isOverdue({ dueAt: null, status: "PENDING" }, NOW)).toBe(false);
  });

  it("prazo futuro não é atrasada", () => {
    expect(isOverdue({ dueAt: "2026-07-15T12:00:00.000Z", status: "PENDING" }, NOW)).toBe(false);
  });

  it("isDueSoon: vence nas próximas 24h", () => {
    expect(isDueSoon({ dueAt: "2026-07-14T20:00:00.000Z", status: "PENDING" }, NOW)).toBe(true);
    expect(isDueSoon({ dueAt: "2026-07-16T20:00:00.000Z", status: "PENDING" }, NOW)).toBe(false);
    // já vencida não é "due soon" — é atrasada
    expect(isDueSoon({ dueAt: "2026-07-13T20:00:00.000Z", status: "PENDING" }, NOW)).toBe(false);
  });
});

describe("datas: local <-> ISO sem deslocar o dia", () => {
  it("round-trip preserva o instante", () => {
    const iso = new Date(2026, 6, 14, 9, 30).toISOString();
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  it("toDateTimeLocal usa o fuso local, não UTC", () => {
    const d = new Date(2026, 0, 1, 0, 30); // 00:30 local — em UTC-3 vira 03:30 UTC
    const local = toDateTimeLocal(d.toISOString());
    expect(local).toBe("2026-01-01T00:30");
    // a conversão ingênua (toISOString().slice(0,16)) deslocaria o dia/hora
    expect(local.slice(0, 10)).toBe("2026-01-01");
  });

  it("fromDateTimeLocal interpreta como hora local e devolve ISO UTC", () => {
    const iso = fromDateTimeLocal("2026-07-14T09:30");
    expect(iso).toBe(new Date(2026, 6, 14, 9, 30).toISOString());
    expect(iso).toMatch(/Z$/);
  });

  it("vazio/inválido vira null (não vai para o backend)", () => {
    expect(fromDateTimeLocal("")).toBeNull();
    expect(fromDateTimeLocal("não é data")).toBeNull();
    expect(toDateTimeLocal(null)).toBe("");
    expect(toDateTimeLocal("lixo")).toBe("");
  });

  it("formatTaskDate lida com null", () => {
    expect(formatTaskDate(null)).toBe("—");
    expect(formatTaskDate("2026-07-14T12:00:00.000Z")).not.toBe("—");
  });
});

describe("papéis elegíveis (AssigneePolicy)", () => {
  it("não oferece papéis que o backend recusaria", () => {
    expect(isAssignableRole("COMMERCIAL")).toBe(true);
    expect(isAssignableRole("OWNER")).toBe(true);
    expect(isAssignableRole("VIEWER")).toBe(false);
    expect(isAssignableRole("FINANCIAL")).toBe(false);
    expect(isAssignableRole("AFFILIATE")).toBe(false);
    expect(ASSIGNABLE_ROLES).not.toContain("VIEWER");
  });
});

describe("mensagens de erro reais do domínio", () => {
  const err = (code: string, statusCode = 400) =>
    new ApiError({ statusCode, code, message: "msg do backend", requestId: "r" });

  it("mapeia os códigos do backend", () => {
    expect(messageForTaskError(err("TASK_NOT_FOUND", 404))).toMatch(/não encontrada/i);
    expect(messageForTaskError(err("TASK_ALREADY_COMPLETED", 409))).toMatch(/já concluída/i);
    expect(messageForTaskError(err("TASK_INVALID_STATUS", 409))).toMatch(/reabrir/i);
    expect(messageForTaskError(err("ASSIGNEE_ROLE_NOT_ALLOWED", 403))).toMatch(/papel/i);
    expect(messageForTaskError(err("ASSIGNEE_INACTIVE", 403))).toMatch(/ativo/i);
    expect(messageForTaskError(err("ASSIGNEE_NOT_COMPANY_MEMBER", 403))).toMatch(/membro/i);
  });

  it("código desconhecido preserva a mensagem do backend (não inventa contrato)", () => {
    expect(messageForTaskError(err("ALGO_NOVO"))).toBe("msg do backend");
  });

  it("erro não-API tem fallback", () => {
    expect(messageForTaskError(new Error("boom"))).toMatch(/não foi possível/i);
  });
});
