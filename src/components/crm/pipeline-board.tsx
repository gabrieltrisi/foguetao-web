"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Loader2, MoreHorizontal, Trophy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ErrorState } from "@/components/ui/error-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { usePipelines } from "@/hooks/crm/use-pipelines";
import { useKanbanBoard, useLoadMoreColumn, useMoveDeal } from "@/hooks/crm/use-kanban";
import { useWinDeal, useLoseDeal } from "@/hooks/crm/use-deals";
import { messageForDealError, dealPriorityMeta } from "@/lib/crm/deal-errors";
import { formatMoney, formatMoneyCompact } from "@/lib/crm/money";
import type { ApiDeal, ApiKanbanColumn, StageCategory } from "@/types/api/crm-deals";

const dotByCategory: Record<StageCategory, string> = {
  OPEN: "bg-brand",
  WON: "bg-success",
  LOST: "bg-danger",
};

/** Kanban real do pipeline — colunas por etapa, cursor independente por coluna. */
export function PipelineBoard() {
  const { can } = useSession();
  const pipelines = usePipelines({ limit: 50 });
  const [selectedId, setSelectedId] = React.useState<string>("");

  const defaultId = React.useMemo(() => {
    const items = pipelines.data?.items ?? [];
    return (items.find((p) => p.isDefault) ?? items[0])?.id ?? "";
  }, [pipelines.data]);

  const pipelineId = selectedId || defaultId;
  const board = useKanbanBoard(pipelineId);

  if (!can("crm.deals.read")) {
    return <p className="py-10 text-center text-body2 text-ink-3">Você não tem permissão para ver oportunidades.</p>;
  }
  if (pipelines.isLoading || (Boolean(pipelineId) && board.isLoading)) {
    return <p className="py-16 text-center text-body2 text-ink-3">Carregando board…</p>;
  }
  if (pipelines.isError || board.isError) {
    return <ErrorState title="Não foi possível carregar o board." onRetry={() => board.refetch()} />;
  }
  if (!pipelineId) {
    return <p className="py-16 text-center text-body2 text-ink-3">Nenhum pipeline configurado.</p>;
  }

  const columns = board.data?.columns ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full max-w-xs">
        <Combobox
          options={(pipelines.data?.items ?? []).map((p) => ({
            value: p.id,
            label: p.isDefault ? `${p.name} (padrão)` : p.name,
          }))}
          value={pipelineId}
          onValueChange={setSelectedId}
          placeholder="Selecione o pipeline"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {columns.map((column) => (
          <KanbanColumn key={column.stageId} pipelineId={pipelineId} column={column} columns={columns} />
        ))}
        {columns.length === 0 ? (
          <p className="py-10 text-body2 text-ink-3">Este pipeline não possui etapas.</p>
        ) : null}
      </div>
    </div>
  );
}

function KanbanColumn({
  pipelineId,
  column,
  columns,
}: {
  pipelineId: string;
  column: ApiKanbanColumn;
  columns: ApiKanbanColumn[];
}) {
  const { loadMore, loadingStageId } = useLoadMoreColumn(pipelineId);
  const total = column.totals[0];
  const count = column.totals.reduce((s, t) => s + t.count, 0);
  const loading = loadingStageId === column.stageId;

  return (
    <section
      className="flex w-[300px] shrink-0 flex-col rounded-xl border border-line bg-surface"
      aria-label={column.name}
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full", dotByCategory[column.category])} aria-hidden />
          <h3 className="truncate text-body2 font-semibold text-ink">{column.name}</h3>
          <span className="rounded-full bg-white px-1.5 text-caption font-semibold text-ink-2">{count}</span>
        </div>
        {total ? (
          <span
            className="shrink-0 text-caption font-medium text-ink-3"
            title={column.totals.map((t) => formatMoney(t.totalValue, t.currency)).join(" · ")}
          >
            {formatMoneyCompact(total.totalValue, total.currency)}
          </span>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
        {column.deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} pipelineId={pipelineId} columns={columns} />
        ))}

        {column.deals.length === 0 ? (
          <p className="py-6 text-center text-caption text-ink-3">Nenhuma oportunidade.</p>
        ) : null}

        {/* Carregar mais: usa o cursor DESTA coluna; o board inteiro não recarrega */}
        {column.nextCursor ? (
          <Button
            size="sm"
            variant="secondary"
            loading={loading}
            onClick={() => loadMore({ stageId: column.stageId, cursor: column.nextCursor! })}
          >
            <ChevronDown className="size-4" aria-hidden />
            Carregar mais
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function DealCard({
  deal,
  pipelineId,
  columns,
}: {
  deal: ApiDeal;
  pipelineId: string;
  columns: ApiKanbanColumn[];
}) {
  const { toast } = useToast();
  const { can } = useSession();
  const move = useMoveDeal(pipelineId);
  const win = useWinDeal(deal.id, pipelineId);
  const lose = useLoseDeal(deal.id, pipelineId);

  const canMove = can("crm.deals.move");
  const canWin = can("crm.deals.win");
  const canLose = can("crm.deals.lose");
  const hasActions = canMove || canWin || canLose;
  const pending = move.isPending || win.isPending || lose.isPending;

  // Mover só entre etapas ABERTAS: WON/LOST exigem as ações Ganhar/Perder.
  const openTargets = columns.filter((c) => c.category === "OPEN" && c.stageId !== deal.stageId);
  const priority = dealPriorityMeta[deal.priority];

  const onError = (e: unknown) => toast({ title: messageForDealError(e), variant: "error" });

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-line bg-white p-3 shadow-sm transition-all hover:border-brand/40 hover:shadow-md",
        pending && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/deals/${deal.id}`} className="min-w-0 flex-1 truncate font-medium text-ink hover:text-brand">
          {deal.title}
        </Link>
        {pending ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-ink-3" aria-hidden />
        ) : hasActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Ações de ${deal.title}`}
                className="shrink-0 rounded-md text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canMove && openTargets.length > 0 ? (
                <>
                  <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                  {openTargets.map((t) => (
                    <DropdownMenuItem
                      key={t.stageId}
                      onSelect={() =>
                        move.mutate(
                          {
                            dealId: deal.id,
                            fromStageId: deal.stageId,
                            toStageId: t.stageId,
                            expectedVersion: deal.version,
                          },
                          { onError },
                        )
                      }
                    >
                      {t.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              ) : null}
              {canWin ? (
                <DropdownMenuItem
                  onSelect={() =>
                    win.mutate(
                      { expectedVersion: deal.version },
                      { onSuccess: () => toast({ title: "Oportunidade ganha", variant: "success" }), onError },
                    )
                  }
                >
                  <Trophy aria-hidden /> Marcar como ganha
                </DropdownMenuItem>
              ) : null}
              {canLose ? (
                <DropdownMenuItem
                  onSelect={() =>
                    lose.mutate(
                      { expectedVersion: deal.version },
                      { onSuccess: () => toast({ title: "Oportunidade perdida", variant: "warning" }), onError },
                    )
                  }
                >
                  <XCircle aria-hidden /> Marcar como perdida
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-display text-body font-bold text-ink">
          {formatMoney(deal.value, deal.currency)}
        </span>
        <Badge tone={priority.tone}>{priority.label}</Badge>
      </div>
    </div>
  );
}
