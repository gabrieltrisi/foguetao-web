import { isApiError } from "@/types/api/error";
import type { ApiKanbanBoard, ApiKanbanColumn, ApiDeal } from "@/types/api/crm-deals";

/** Conflito de versão (optimistic locking) reportado pelo backend. */
export function isVersionConflict(error: unknown): boolean {
  return isApiError(error) && error.code === "DEAL_VERSION_CONFLICT";
}

export function findDeal(board: ApiKanbanBoard | undefined, dealId: string): ApiDeal | undefined {
  return board?.columns.flatMap((c) => c.deals).find((d) => d.id === dealId);
}

export function findColumnOfDeal(board: ApiKanbanBoard | undefined, dealId: string): ApiKanbanColumn | undefined {
  return board?.columns.find((c) => c.deals.some((d) => d.id === dealId));
}

/**
 * Move um card entre colunas no board em cache (optimistic update).
 * Puro: devolve um novo board. Não altera contadores/totais do backend — eles
 * são reconciliados no refetch da coluna. Sem card ou etapa alvo, devolve o
 * board original (no-op seguro).
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
    columns: board.columns.map((c) => {
      if (c.deals.some((d) => d.id === dealId)) {
        // remove da coluna de origem
        return { ...c, deals: c.deals.filter((d) => d.id !== dealId) };
      }
      if (c.stageId === toStageId) {
        // insere no topo da coluna de destino com o stageId novo
        return { ...c, deals: [{ ...deal, stageId: toStageId }, ...c.deals] };
      }
      return c;
    }),
  };
}

/**
 * Substitui um card pelo retorno autoritativo do servidor (nova `version` e
 * `stageId`), reposicionando-o na coluna correta. Puro.
 */
export function replaceCardInBoard(board: ApiKanbanBoard, deal: ApiDeal): ApiKanbanBoard {
  const withoutDeal = board.columns.map((c) => ({
    ...c,
    deals: c.deals.filter((d) => d.id !== deal.id),
  }));
  return {
    ...board,
    columns: withoutDeal.map((c) =>
      c.stageId === deal.stageId ? { ...c, deals: [deal, ...c.deals] } : c,
    ),
  };
}

/** Remove um card do board (ex.: arquivado ou saiu dos status do board). */
export function removeCardFromBoard(board: ApiKanbanBoard, dealId: string): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((c) => ({ ...c, deals: c.deals.filter((d) => d.id !== dealId) })),
  };
}

/**
 * Anexa a próxima página de UMA coluna (paginação por cursor), preservando as
 * demais colunas intactas. Deduplica por id e atualiza `nextCursor`/`totals`.
 */
export function appendColumnPage(board: ApiKanbanBoard, page: ApiKanbanColumn): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((c) => {
      if (c.stageId !== page.stageId) return c;
      const seen = new Set(c.deals.map((d) => d.id));
      const merged = [...c.deals, ...page.deals.filter((d) => !seen.has(d.id))];
      return { ...c, deals: merged, nextCursor: page.nextCursor, totals: page.totals };
    }),
  };
}

/** Substitui uma coluna inteira (usado no refetch pós-conflito). */
export function replaceColumn(board: ApiKanbanBoard, column: ApiKanbanColumn): ApiKanbanBoard {
  return {
    ...board,
    columns: board.columns.map((c) => (c.stageId === column.stageId ? column : c)),
  };
}
