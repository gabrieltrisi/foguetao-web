"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pipelinesApi, dealsApi } from "@/lib/api/crm-deals/client";
import { queryKeys, crmInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";
import {
  moveCardInBoard,
  replaceCardInBoard,
  appendColumnPage,
  replaceColumn,
  isVersionConflict,
} from "@/lib/crm/kanban";
import type { ApiKanbanBoard } from "@/types/api/crm-deals";

const PER_COLUMN = 20;

/** Board do Kanban (primeira página por coluna). */
export function useKanbanBoard(pipelineId: string) {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.crm.kanban(pipelineId), activeCompanyId],
    queryFn: () => pipelinesApi.kanbanBoard(pipelineId, PER_COLUMN),
    enabled: Boolean(activeCompanyId) && Boolean(pipelineId) && can("crm.deals.read"),
  });
}

/**
 * "Carregar mais" de UMA coluna: busca a próxima página pelo cursor da coluna
 * e faz merge no board em cache — o board inteiro NUNCA é recarregado.
 */
export function useLoadMoreColumn(pipelineId: string) {
  const qc = useQueryClient();
  const { activeCompanyId } = useSession();
  const key = [...queryKeys.crm.kanban(pipelineId), activeCompanyId];
  const [loadingStageId, setLoadingStageId] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ stageId, cursor }: { stageId: string; cursor: string }) =>
      pipelinesApi.kanbanColumn(pipelineId, stageId, { limit: PER_COLUMN, cursor }),
    onMutate: ({ stageId }) => setLoadingStageId(stageId),
    onSettled: () => setLoadingStageId(null),
    onSuccess: (page) => {
      qc.setQueryData<ApiKanbanBoard>(key, (board) => (board ? appendColumnPage(board, page) : board));
    },
  });

  return { loadMore: mutation.mutate, loadingStageId, isError: mutation.isError };
}

/**
 * Move um deal entre etapas com optimistic locking:
 *  1. optimistic update no board em cache;
 *  2. POST /deals/:id/move com expectedVersion;
 *  3. sucesso → substitui o card pelo retorno do servidor (nova version);
 *  4. DEAL_VERSION_CONFLICT (ou outro erro) → rollback e, no conflito,
 *     refetch APENAS das colunas de origem/destino.
 */
export function useMoveDeal(pipelineId: string) {
  const qc = useQueryClient();
  const { activeCompanyId } = useSession();
  const key = [...queryKeys.crm.kanban(pipelineId), activeCompanyId];

  const refetchColumns = async (stageIds: string[]) => {
    const pages = await Promise.all(
      stageIds.map((stageId) =>
        pipelinesApi.kanbanColumn(pipelineId, stageId, { limit: PER_COLUMN }).catch(() => null),
      ),
    );
    qc.setQueryData<ApiKanbanBoard>(key, (board) => {
      if (!board) return board;
      return pages.reduce<ApiKanbanBoard>((acc, page) => (page ? replaceColumn(acc, page) : acc), board);
    });
  };

  return useMutation({
    mutationFn: ({
      dealId,
      toStageId,
      expectedVersion,
      reason,
    }: {
      dealId: string;
      fromStageId: string;
      toStageId: string;
      expectedVersion: number;
      reason?: string;
    }) => dealsApi.move(dealId, { toStageId, expectedVersion, reason }),

    onMutate: async ({ dealId, toStageId }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ApiKanbanBoard>(key);
      if (previous) qc.setQueryData<ApiKanbanBoard>(key, moveCardInBoard(previous, dealId, toStageId));
      return { previous };
    },

    onError: async (error, vars, ctx) => {
      // rollback do optimistic update
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      // conflito de versão → reconcilia apenas as colunas afetadas
      if (isVersionConflict(error)) {
        await refetchColumns([vars.fromStageId, vars.toStageId]);
      }
    },

    onSuccess: (serverDeal) => {
      qc.setQueryData<ApiKanbanBoard>(key, (board) => (board ? replaceCardInBoard(board, serverDeal) : board));
      qc.invalidateQueries({ queryKey: crmInvalidation.deal(serverDeal.id) });
      qc.invalidateQueries({ queryKey: crmInvalidation.allDeals });
    },
  });
}
