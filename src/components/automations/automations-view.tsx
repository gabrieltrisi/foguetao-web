"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Table2, Workflow, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { OwnerBadge } from "@/components/business/badges";
import { Badge } from "@/components/ui/badge";
import { AutomationStatusBadge } from "@/components/automations/badges";
import { NodeIcon } from "@/components/automations/node-icon";
import { getNodeType } from "@/mocks/automations/nodes";
import { automations } from "@/mocks/automations/automations";
import { formatNumber } from "@/lib/format";
import type { Automation } from "@/types/automations";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
  { value: "draft", label: "Rascunho" },
];

function SuccessBar({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface" aria-hidden>
        <span className={cn("block h-full rounded-full", value >= 95 ? "bg-success" : value >= 85 ? "bg-warning" : "bg-danger")} style={{ width: `${value}%` }} />
      </span>
      <span className="tabular-nums text-ink-2">{value}%</span>
    </span>
  );
}

export function AutomationsView() {
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("todos");

  const filtered = automations.filter((a) => {
    const ms = status === "todos" || a.status === status;
    const q = query.trim().toLowerCase();
    return ms && (!q || `${a.name} ${a.triggerLabel}`.toLowerCase().includes(q));
  });

  const active = automations.filter((a) => a.status === "active").length;
  const totalExec = automations.reduce((s, a) => s + a.executions, 0);
  const avgSuccess = Math.round((automations.reduce((s, a) => s + a.successRate, 0) / automations.length) * 10) / 10;

  const columns: DataTableColumn<Automation>[] = [
    { id: "name", header: "Automação", sortable: true, sortAccessor: (a) => a.name, cell: (a) => <Link href={`/automations/${a.id}`} className="font-medium text-ink hover:text-brand">{a.name}</Link> },
    { id: "status", header: "Status", cell: (a) => <AutomationStatusBadge status={a.status} /> },
    { id: "trigger", header: "Gatilho", cell: (a) => <span className="inline-flex items-center gap-2"><NodeIcon name={getNodeType(a.triggerTypeId)?.icon ?? "Zap"} category="trigger" className="size-7" /><span className="text-ink-2">{a.triggerLabel}</span></span> },
    { id: "last", header: "Última exec.", cell: (a) => <span className="text-ink-2">{a.lastRun}</span> },
    { id: "success", header: "Sucesso", sortable: true, sortAccessor: (a) => a.successRate, cell: (a) => <SuccessBar value={a.successRate} /> },
    { id: "exec", header: "Execuções", sortable: true, sortAccessor: (a) => a.executions, className: "text-right tabular-nums", cell: (a) => formatNumber(a.executions) },
    { id: "owner", header: "Responsável", cell: (a) => <OwnerBadge name={a.owner} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand"><Workflow className="size-5" aria-hidden /></span><KPIBlock label="Ativas" value={String(active)} /></Card>
        <Card className="p-5"><KPIBlock label="Execuções" value={formatNumber(totalExec)} delta="+18%" trend="up" /></Card>
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><Zap className="size-5" aria-hidden /></span><KPIBlock label="Sucesso médio" value={`${avgSuccess}%`} /></Card>
        <Card className="p-5"><KPIBlock label="Rascunhos" value={String(automations.filter((a) => a.status === "draft").length)} /></Card>
      </div>

      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar automações…" containerClassName="w-full max-w-xs" />
        <div className="w-44"><Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} /></div>
        <SegmentedControl className="ml-auto" options={[{ value: "table", label: "Tabela", icon: <Table2 className="size-4" /> }, { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> }]} value={view} onValueChange={setView} />
      </FilterBar>

      {view === "table" ? (
        <DataTable data={filtered} columns={columns} getRowId={(a) => a.id} empty={{ icon: Workflow, title: "Nenhuma automação encontrada." }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => <AutomationCard key={a.id} automation={a} />)}
          {filtered.length === 0 ? <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhuma automação encontrada.</p> : null}
        </div>
      )}
    </div>
  );
}

function AutomationCard({ automation: a }: { automation: Automation }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/automations/${a.id}`} className="min-w-0 truncate font-display text-h3 font-semibold text-ink hover:text-brand">{a.name}</Link>
        <AutomationStatusBadge status={a.status} />
      </div>
      <span className="inline-flex items-center gap-2">
        <NodeIcon name={getNodeType(a.triggerTypeId)?.icon ?? "Zap"} category="trigger" className="size-7" />
        <span className="text-caption text-ink-2">{a.triggerLabel}</span>
      </span>
      {/* Mini fluxo */}
      <div className="flex items-center gap-1 overflow-hidden">
        {a.nodes.slice(0, 5).map((node, i) => {
          const cat = getNodeType(node.typeId)?.category ?? "action";
          return (
            <React.Fragment key={node.id}>
              {i > 0 ? <span className="h-px w-3 shrink-0 bg-line" aria-hidden /> : null}
              <NodeIcon name={getNodeType(node.typeId)?.icon ?? "Workflow"} category={cat} className="size-7 shrink-0" />
            </React.Fragment>
          );
        })}
        {a.nodes.length > 5 ? <span className="ml-1 text-caption text-ink-3">+{a.nodes.length - 5}</span> : null}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
        <div><p className="font-display text-body font-bold text-ink">{a.successRate}%</p><p className="text-caption text-ink-3">Sucesso</p></div>
        <div><p className="font-display text-body font-bold text-ink">{formatNumber(a.executions)}</p><p className="text-caption text-ink-3">Exec.</p></div>
        <div><Badge tone="neutral" className="normal-case">{a.category}</Badge></div>
      </div>
    </Card>
  );
}
