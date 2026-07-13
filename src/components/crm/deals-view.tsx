"use client";

import * as React from "react";
import Link from "next/link";
import { Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar, ActiveFilters, SavedViewSelector } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { OwnerBadge, StatusBadge } from "@/components/business/badges";
import { TagList } from "@/components/crm/tags";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import { deals, pipelineStages } from "@/mocks/crm/deals";
import type { Deal, PipelineStageId } from "@/types/crm";

const stageTone: Record<PipelineStageId, "neutral" | "info" | "warning" | "success" | "brand"> = {
  "novo-lead": "neutral",
  contato: "neutral",
  qualificado: "info",
  proposta: "info",
  negociacao: "warning",
  ganho: "success",
};

const stageLabel = Object.fromEntries(pipelineStages.map((s) => [s.id, s.label])) as Record<PipelineStageId, string>;

const STAGE_OPTIONS = [
  { value: "todos", label: "Todas as etapas" },
  ...pipelineStages.map((s) => ({ value: s.id, label: s.label })),
];

export function DealsView() {
  const { toast } = useToast();
  const [stage, setStage] = React.useState("todos");
  const [query, setQuery] = React.useState("");
  const [savedView, setSavedView] = React.useState("todos");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const filtered = deals.filter((d) => {
    const matchStage = stage === "todos" || d.stageId === stage;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || `${d.title} ${d.organizationName} ${d.contactName} ${d.owner}`.toLowerCase().includes(q);
    return matchStage && matchQuery;
  });

  const columns: DataTableColumn<Deal>[] = [
    {
      id: "title",
      header: "Oportunidade",
      sortable: true,
      sortAccessor: (d) => d.title,
      cell: (d) => (
        <div className="min-w-0">
          <Link href={`/deals/${d.id}`} className="block truncate font-medium text-ink hover:text-brand">
            {d.title}
          </Link>
          <div className="mt-0.5"><TagList tags={d.tags} /></div>
        </div>
      ),
    },
    { id: "org", header: "Organização", cell: (d) => (
      <div className="min-w-0">
        <p className="truncate text-ink">{d.organizationName}</p>
        <p className="truncate text-caption text-ink-3">{d.contactName}</p>
      </div>
    ) },
    { id: "stage", header: "Etapa", cell: (d) => <StatusBadge tone={stageTone[d.stageId]}>{stageLabel[d.stageId]}</StatusBadge> },
    {
      id: "probability",
      header: "Prob.",
      sortable: true,
      sortAccessor: (d) => d.probability,
      cell: (d) => (
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface" aria-hidden>
            <span className="block h-full rounded-full bg-brand" style={{ width: `${d.probability}%` }} />
          </span>
          <span className="text-caption text-ink-2">{d.probability}%</span>
        </div>
      ),
    },
    { id: "owner", header: "Responsável", cell: (d) => <OwnerBadge name={d.owner} /> },
    {
      id: "value",
      header: "Valor",
      sortable: true,
      sortAccessor: (d) => d.value,
      className: "text-right tabular-nums",
      cell: (d) => formatCurrency(d.value),
    },
    { id: "close", header: "Fechamento", cell: (d) => <span className="text-ink-2">{d.closeDate}</span> },
  ];

  const activeFilters = stage !== "todos" ? [{ id: "stage", label: "Etapa", value: stageLabel[stage as PipelineStageId] }] : [];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar oportunidades…" containerClassName="w-full max-w-xs" />
        <SavedViewSelector
          views={[
            { id: "todos", label: "Todas" },
            { id: "minhas", label: "Minhas" },
            { id: "fechando", label: "Fechando este mês" },
          ]}
          value={savedView}
          onValueChange={setSavedView}
        />
        <div className="w-48">
          <Combobox options={STAGE_OPTIONS} value={stage} onValueChange={setStage} />
        </div>
      </FilterBar>

      {activeFilters.length > 0 ? (
        <ActiveFilters filters={activeFilters} onRemove={() => setStage("todos")} onClear={() => setStage("todos")} />
      ) : null}

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(d) => d.id}
        selectable
        empty={{ icon: Target, title: "Nenhuma oportunidade encontrada." }}
        bulkActions={(ids) => (
          <>
            <Button size="sm" variant="secondary">Mover etapa</Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)} aria-label={`Excluir ${ids.length}`}>
              <Trash2 />
              Excluir
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir oportunidades?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => toast({ title: "Oportunidades excluídas (mock)", variant: "success" })}
      />
    </div>
  );
}
