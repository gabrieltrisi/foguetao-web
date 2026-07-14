import { isApiError } from "@/types/api/error";
import type { ApiKanbanBoard, ApiKanbanColumn, ApiDeal } from "@/types/api/crm-deals";

/**
 * Transformações puras do board em cache.
 *
 * Invariante de performance: colunas NÃO afetadas mantêm a mesma referência.
 * Com `React.memo` nas colunas/cards, mover um card re-renderiza apenas as
 * colunas de origem e destino — nunca o board inteiro.
 */

/** Conflito de versão (optimistic locking) reportado pelo backend. */
export function isVersionConflict(error: unknown): boolean {
  return isApiError(error) && error.code === "DEAL_VERSION_CONFLICT";
}

export function findDeal(board: ApiKanbanBoard | undefined, dealId: string): ApiDeal | undefined {
  return board?.columns.flatMap((c) => c.deals).find((d) => d.id === dealId);
}

/**
 * Move um card entre colunas (optimistic update). Devolve o board original
 * quando é no-op (card/etapa inexistente ou mesma etapa).
 */
export function moveCardInBoard(
  board: ApiKanbanBoard,
  dealId: string,
  toStageId: string,
): ApiKanbanBoard {
  const deal = findDeal(board, dealId);
  const target = board.columns.find((c) => c.stageId === toStageId);
  if (!deal || !target || deal.stageId === toStageId) return board;

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.deals.some((d) => d.id === dealId)) {
        return { ...column, deals: column.deals.filter((d) => d.id !== dealId) };
      }
      if (column.stageId === toStageId) {
        return { ...column, deals: [{ ...deal, stageId: toStageId }, ...column.deals] };
      }
      return column; // identidade preservada
    }),
  };
}

/**
 * Aplica o retorno autoritativo do servidor (nova `version`/`stageId`).
 * Se o card já está na coluna certa, é substituído no lugar (preserva a ordem);
 * caso contrário, é removido da origem e inserido no topo do destino.
 */
export function replaceCardInBoard(board: ApiKanbanBoard, deal: ApiDeal): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((column) => {
      const contains = column.deals.some((d) => d.id === deal.id);
      const isTarget = column.stageId === deal.stageId;

      if (contains && isTarget) {
        return { ...column, deals: column.deals.map((d) => (d.id === deal.id ? deal : d)) };
      }
      if (contains) {
        return { ...column, deals: column.deals.filter((d) => d.id !== deal.id) };
      }
      if (isTarget) {
        return { ...column, deals: [deal, ...column.deals] };
      }
      return column; // identidade preservada
    }),
  };
}

/**
 * Anexa a próxima página de UMA coluna (paginação por cursor). Deduplica por id
 * e atualiza `nextCursor`/`totals`; as demais colunas mantêm a referência.
 */
export function appendColumnPage(board: ApiKanbanBoard, page: ApiKanbanColumn): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.stageId !== page.stageId) return column; // identidade preservada
      const seen = new Set(column.deals.map((d) => d.id));
      return {
        ...column,
        deals: [...column.deals, ...page.deals.filter((d) => !seen.has(d.id))],
        nextCursor: page.nextCursor,
        totals: page.totals,
      };
    }),
  };
}

/** Substitui uma coluna inteira (refetch pós-conflito de versão). */
export function replaceColumn(board: ApiKanbanBoard, column: ApiKanbanColumn): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((c) => (c.stageId === column.stageId ? column : c)),
  };
}
