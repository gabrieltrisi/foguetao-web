"use client";

import Link from "next/link";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { TagList } from "@/components/crm/tags";
import { formatCurrency } from "@/lib/format";
import { pipelineStages, dealsByStage, stageTotal } from "@/mocks/crm/deals";
import type { Deal } from "@/types/crm";

/** Kanban do pipeline — colunas por etapa, scroll horizontal, drag visual (mock). */
export function PipelineBoard() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {pipelineStages.map((stage) => {
        const stageDeals = dealsByStage(stage.id);
        const isWon = stage.id === "ganho";
        return (
          <section
            key={stage.id}
            className="flex w-[300px] shrink-0 flex-col rounded-xl border border-line bg-surface"
            aria-label={stage.label}
          >
            <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", isWon ? "bg-success" : "bg-brand")} aria-hidden />
                <h3 className="text-body2 font-semibold text-ink">{stage.label}</h3>
                <span className="rounded-full bg-white px-1.5 text-caption font-semibold text-ink-2">
                  {stageDeals.length}
                </span>
              </div>
              <span className="text-caption font-medium text-ink-3">
                {formatCurrency(stageTotal(stage.id))}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
              {stageDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} won={isWon} />
              ))}
              <button
                type="button"
                className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-line py-2 text-caption font-medium text-ink-3 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Plus className="size-3.5" aria-hidden />
                Adicionar
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DealCard({ deal, won }: { deal: Deal; won?: boolean }) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      draggable
      className="group block cursor-grab rounded-lg border border-line bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate font-medium text-ink">{deal.title}</p>
        <GripVertical
          className="size-4 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <p className="mt-0.5 truncate text-caption text-ink-3">
        {deal.organizationName} · {deal.contactName}
      </p>
      <div className="mt-2">
        <TagList tags={deal.tags} />
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-body font-bold text-ink">{formatCurrency(deal.value)}</span>
        <EntityAvatar name={deal.owner} size="sm" className="size-6 text-[10px]" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
          <span
            className={cn("block h-full rounded-full", won ? "bg-success" : "bg-brand")}
            style={{ width: `${deal.probability}%` }}
          />
        </span>
        <span className="text-caption text-ink-3">{deal.probability}%</span>
      </div>
    </Link>
  );
}
