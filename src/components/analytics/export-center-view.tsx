"use client";

import * as React from "react";
import { Download, FileDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ExportStatusBadge } from "@/components/analytics/badges";
import { OwnerBadge } from "@/components/business/badges";
import { useToast } from "@/components/ui/toast";
import { exportJobs, formatLabel } from "@/mocks/analytics/exports";
import type { ExportJob } from "@/types/analytics";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "ready", label: "Pronto" },
  { value: "processing", label: "Processando" },
  { value: "failed", label: "Falhou" },
  { value: "expired", label: "Expirado" },
];

export function ExportCenterView() {
  const { toast } = useToast();
  const [status, setStatus] = React.useState("todos");
  const filtered = exportJobs.filter((j) => status === "todos" || j.status === status);

  const columns: DataTableColumn<ExportJob>[] = [
    { id: "report", header: "Relatório", sortable: true, sortAccessor: (j) => j.report, cell: (j) => <span className="font-medium text-ink">{j.report}</span> },
    { id: "format", header: "Formato", cell: (j) => <Badge tone="neutral" className="normal-case">{formatLabel[j.format]}</Badge> },
    { id: "status", header: "Status", cell: (j) => <ExportStatusBadge status={j.status} /> },
    { id: "by", header: "Solicitado por", cell: (j) => <OwnerBadge name={j.requestedBy} /> },
    { id: "date", header: "Data", cell: (j) => <span className="text-ink-2">{j.date}</span> },
    { id: "expires", header: "Expira em", cell: (j) => <span className="text-ink-2">{j.expiresAt}</span> },
    { id: "size", header: "Tamanho", className: "text-right tabular-nums", cell: (j) => j.size },
    {
      id: "actions", header: "", hideable: false, className: "text-right",
      cell: (j) => (
        j.status === "ready" ? (
          <Button size="sm" variant="secondary" onClick={() => toast({ title: `Baixando ${j.report}.${j.format} (mock)`, variant: "success" })}><Download />Baixar</Button>
        ) : j.status === "processing" ? (
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => toast({ title: "Exportação cancelada (mock)", variant: "warning" })}><X />Cancelar</Button>
        ) : <span className="text-caption text-ink-3">—</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <FilterBar><div className="w-48"><Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} /></div></FilterBar>
        <Button size="sm" onClick={() => toast({ title: "Exportação solicitada (mock)", variant: "success" })}><Plus />Nova exportação</Button>
      </div>
      <DataTable data={filtered} columns={columns} getRowId={(j) => j.id} pageSize={8} empty={{ icon: FileDown, title: "Nenhuma exportação." }} />
    </div>
  );
}
