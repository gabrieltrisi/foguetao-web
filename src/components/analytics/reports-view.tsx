"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, CalendarClock, LayoutGrid, Share2, Star, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { OwnerBadge } from "@/components/business/badges";
import { ReportStatusBadge } from "@/components/analytics/badges";
import { ReportCard } from "@/components/analytics/report-card";
import { formatNumber } from "@/lib/format";
import { reports } from "@/mocks/analytics/reports";
import type { Report } from "@/types/analytics";

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "favoritos", label: "Favoritos" },
  { value: "compartilhados", label: "Compartilhados" },
  { value: "agendados", label: "Agendados" },
];

export function ReportsView() {
  const [view, setView] = React.useState<"cards" | "table">("cards");
  const [quick, setQuick] = React.useState("todos");
  const [query, setQuery] = React.useState("");
  const [favs, setFavs] = React.useState<Record<string, boolean>>(Object.fromEntries(reports.map((r) => [r.id, r.favorite])));

  const filtered = reports.filter((r) => {
    const q = query.trim().toLowerCase();
    const mq = !q || `${r.name} ${r.description}`.toLowerCase().includes(q);
    const mf =
      quick === "todos" ||
      (quick === "favoritos" && favs[r.id]) ||
      (quick === "compartilhados" && r.shared) ||
      (quick === "agendados" && r.scheduled);
    return mq && mf;
  });

  const columns: DataTableColumn<Report>[] = [
    { id: "name", header: "Relatório", sortable: true, sortAccessor: (r) => r.name, cell: (r) => <Link href={`/reports/${r.id}`} className="font-medium text-ink hover:text-brand">{r.name}</Link> },
    { id: "category", header: "Categoria", cell: (r) => <Badge tone="neutral" className="normal-case">{r.category}</Badge> },
    { id: "status", header: "Status", cell: (r) => <ReportStatusBadge status={r.status} /> },
    { id: "flags", header: "", cell: (r) => (
      <span className="flex items-center gap-1.5 text-ink-3">
        {favs[r.id] ? <Star className="size-3.5 fill-warning text-warning" aria-label="Favorito" /> : null}
        {r.shared ? <Share2 className="size-3.5" aria-label="Compartilhado" /> : null}
        {r.scheduled ? <CalendarClock className="size-3.5" aria-label="Agendado" /> : null}
      </span>
    ) },
    { id: "owner", header: "Responsável", cell: (r) => <OwnerBadge name={r.owner} /> },
    { id: "views", header: "Views", sortable: true, sortAccessor: (r) => r.views, className: "text-right tabular-nums", cell: (r) => formatNumber(r.views) },
    { id: "updated", header: "Atualizado", cell: (r) => <span className="text-ink-2">{r.updatedAt}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar relatórios…" containerClassName="w-full max-w-xs" />
        <SegmentedControl size="sm" options={FILTERS} value={quick} onValueChange={setQuick} ariaLabel="Filtro rápido" />
        <SegmentedControl className="ml-auto" options={[{ value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> }, { value: "table", label: "Tabela", icon: <Table2 className="size-4" /> }]} value={view} onValueChange={setView} />
      </FilterBar>

      {view === "cards" ? (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} favorite={favs[r.id]} onToggleFav={() => setFavs((p) => ({ ...p, [r.id]: !p[r.id] }))} />
          ))}
          {filtered.length === 0 ? <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhum relatório encontrado.</p> : null}
        </div>
      ) : (
        <DataTable data={filtered} columns={columns} getRowId={(r) => r.id} empty={{ icon: BarChart3, title: "Nenhum relatório encontrado." }} />
      )}
    </div>
  );
}
