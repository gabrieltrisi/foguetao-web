import { describe, it, expect } from "vitest";
import {
  moveCardInBoard,
  replaceCardInBoard,
  removeCardFromBoard,
  appendColumnPage,
  replaceColumn,
  findDeal,
  findColumnOfDeal,
  isVersionConflict,
} from "@/lib/crm/kanban";
import { ApiError } from "@/types/api/error";
import type { ApiKanbanBoard, ApiKanbanColumn, ApiDeal } from "@/types/api/crm-deals";

function deal(id: string, stageId: string, version = 1): ApiDeal {
  return {
    id,
    pipelineId: "p1",
    stageId,
    contactId: null,
    organizationId: null,
    assignedToUserId: null,
    title: `Deal ${id}`,
    description: null,
    value: "100.00",
    currency: "BRL",
    weightedValue: "10.00",
    status: "OPEN",
    priority: "MEDIUM",
    source: null,
    expectedCloseDate: null,
    wonAt: null,
    lostAt: null,
    lostReasonId: null,
    lostReasonText: null,
    version,
    lastStageChangedAt: "x",
    lastActivityAt: null,
    createdAt: "x",
    updatedAt: "x",
  };
}

function column(stageId: string, deals: ApiDeal[], nextCursor: string | null = null): ApiKanbanColumn {
  return {
    stageId,
    name: `Etapa ${stageId}`,
    category: "OPEN",
    position: 0,
    probability: 10,
    deals,
    nextCursor,
    totals: [{ currency: "BRL", count: deals.length, totalValue: "100.00", weightedValue: "10.00" }],
  };
}

const board = (): ApiKanbanBoard => ({
  pipelineId: "p1",
  columns: [column("s1", [deal("d1", "s1"), deal("d2", "s1")]), column("s2", [deal("d3", "s2")])],
});

describe("optimistic update do Kanban", () => {
  it("moveCardInBoard move o card entre colunas e ajusta o stageId", () => {
    const next = moveCardInBoard(board(), "d1", "s2");
    expect(next.columns[0].deals.map((d) => d.id)).toEqual(["d2"]);
    expect(next.columns[1].deals.map((d) => d.id)).toEqual(["d1", "d3"]);
    expect(next.columns[1].deals[0].stageId).toBe("s2");
  });

  it("moveCardInBoard é imutável (não altera o board original — permite rollback)", () => {
    const original = board();
    const snapshot = JSON.parse(JSON.stringify(original));
    moveCardInBoard(original, "d1", "s2");
    expect(original).toEqual(snapshot);
  });

  it("moveCardInBoard é no-op para card inexistente, etapa inexistente ou mesma etapa", () => {
    const b = board();
    expect(moveCardInBoard(b, "nao-existe", "s2")).toBe(b);
    expect(moveCardInBoard(b, "d1", "etapa-inexistente")).toBe(b);
    expect(moveCardInBoard(b, "d1", "s1")).toBe(b);
  });

  it("replaceCardInBoard aplica o retorno do servidor (nova version/etapa)", () => {
    const moved = moveCardInBoard(board(), "d1", "s2");
    const server = { ...deal("d1", "s2", 2), title: "Deal atualizado" };
    const next = replaceCardInBoard(moved, server);
    const found = findDeal(next, "d1")!;
    expect(found.version).toBe(2);
    expect(found.title).toBe("Deal atualizado");
    // sem duplicidade
    expect(next.columns.flatMap((c) => c.deals).filter((d) => d.id === "d1")).toHaveLength(1);
    expect(findColumnOfDeal(next, "d1")!.stageId).toBe("s2");
  });

  it("removeCardFromBoard remove o card de qualquer coluna", () => {
    const next = removeCardFromBoard(board(), "d3");
    expect(findDeal(next, "d3")).toBeUndefined();
  });
});

describe("paginação por cursor (carregar mais por coluna)", () => {
  it("appendColumnPage anexa só na coluna alvo e atualiza nextCursor", () => {
    const b = { ...board() };
    b.columns[0] = column("s1", [deal("d1", "s1")], "d1");
    const page = column("s1", [deal("d9", "s1")], null);
    const next = appendColumnPage(b, page);

    expect(next.columns[0].deals.map((d) => d.id)).toEqual(["d1", "d9"]);
    expect(next.columns[0].nextCursor).toBeNull();
    // outras colunas intactas
    expect(next.columns[1]).toEqual(b.columns[1]);
  });

  it("appendColumnPage deduplica por id", () => {
    const b = board();
    const page = column("s1", [deal("d2", "s1"), deal("d7", "s1")], null);
    const next = appendColumnPage(b, page);
    expect(next.columns[0].deals.map((d) => d.id)).toEqual(["d1", "d2", "d7"]);
  });

  it("replaceColumn troca a coluna inteira (refetch pós-conflito)", () => {
    const fresh = column("s1", [deal("dX", "s1")], null);
    const next = replaceColumn(board(), fresh);
    expect(next.columns[0].deals.map((d) => d.id)).toEqual(["dX"]);
    expect(next.columns[1].deals.map((d) => d.id)).toEqual(["d3"]);
  });
});

describe("conflito de versão", () => {
  it("isVersionConflict detecta DEAL_VERSION_CONFLICT", () => {
    expect(isVersionConflict(new ApiError({ statusCode: 409, code: "DEAL_VERSION_CONFLICT", message: "x" }))).toBe(true);
    expect(isVersionConflict(new ApiError({ statusCode: 409, code: "DEAL_ALREADY_WON", message: "x" }))).toBe(false);
    expect(isVersionConflict(new Error("boom"))).toBe(false);
  });

  it("rollback: restaurar o snapshot anterior desfaz o movimento", () => {
    const previous = board();
    const optimistic = moveCardInBoard(previous, "d1", "s2");
    expect(findColumnOfDeal(optimistic, "d1")!.stageId).toBe("s2");
    // rollback = voltar ao snapshot
    expect(findColumnOfDeal(previous, "d1")!.stageId).toBe("s1");
  });
});
