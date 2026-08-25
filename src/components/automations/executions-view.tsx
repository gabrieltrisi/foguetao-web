"use client";

import * as React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ExecutionStatusBadge } from "@/components/automations/badges";
import { executions } from "@/mocks/automations/executions";
import type { Execution } from "@/types/automations";

const STATUS_OPTIONS = [
  { value: "todas", label: "Todos os status" },
  { value: "success", label: "Sucesso" },
  { value: "failed", label: "Falha" },
  { value: "running", label: "Em execução" },
  { value: "retrying", label: "Retentando" },
];

export function ExecutionsView({ automationId }: { automationId?: string }) {
  const [status, setStatus] = React.useState("todas");

  const base = automationId ? executions.filter((e) => e.automationId === automationId) : executions;
  const filtered = base.filter((e) => status === "todas" || e.status === status);

  const columns: DataTableColumn<Execution>[] = [
    { id: "name", header: "Fluxo", sortable: true, sortAccessor: (e) => e.automationName, cell: (e) => <Link href={`/automation-executions/${e.id}`} className="font-medium text-ink hover:text-brand">{e.automationName}</Link> },
    { id: "status", header: "Status", cell: (e) => <ExecutionStatusBadge status={e.status} /> },
    { id: "trigger", header: "Trigger", cell: (e) => <span className="text-ink-2">{e.trigger}</span> },
    { id: "start", header: "Início", cell: (e) => <span className="text-ink-2">{e.startedAt}</span> },
    { id: "duration", header: "Duração", className: "text-right tabular-nums", cell: (e) => e.duration },
    { id: "attempt", header: "Tentativa", className: "text-right", cell: (e) => (e.attempt > 1 ? <span className="text-warning">{e.attempt}/3</span> : "1") },
    { id: "action", header: "", hideable: false, className: "text-right", cell: (e) => <Button asChild size="sm" variant="secondary"><Link href={`/automation-executions/${e.id}`}>Ver</Link></Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <div className="w-48"><Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} /></div>
      </FilterBar>
      <DataTable data={filtered} columns={columns} getRowId={(e) => e.id} pageSize={10} empty={{ icon: Activity, title: "Nenhuma execução." }} />
    </div>
  );
}
