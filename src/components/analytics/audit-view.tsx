"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { AuditStatusBadge } from "@/components/analytics/badges";
import { AuditDetailSheet } from "@/components/analytics/audit-detail-sheet";
import { auditEvents, auditModules } from "@/mocks/analytics/audit";
import type { AuditEvent } from "@/types/analytics";

export function AuditView() {
  const [module, setModule] = React.useState("Todos");
  const [selected, setSelected] = React.useState<AuditEvent | undefined>();

  const moduleOptions = auditModules.map((m) => ({ value: m, label: m === "Todos" ? "Todos os módulos" : m }));
  const filtered = auditEvents.filter((e) => module === "Todos" || e.module === module);

  const columns: DataTableColumn<AuditEvent>[] = [
    { id: "user", header: "Usuário", cell: (e) => <span className="font-medium text-ink">{e.user}</span> },
    { id: "action", header: "Ação", cell: (e) => e.action },
    { id: "entity", header: "Entidade", cell: (e) => <span className="text-ink-2">{e.entity}</span> },
    { id: "module", header: "Módulo", cell: (e) => <Badge tone="neutral" className="normal-case">{e.module}</Badge> },
    { id: "date", header: "Data", cell: (e) => <span className="text-ink-2">{e.date}</span> },
    { id: "ip", header: "IP", hideable: true, cell: (e) => <code className="font-mono text-caption text-ink-3">{e.ip}</code> },
    { id: "status", header: "Status", cell: (e) => <AuditStatusBadge status={e.status} /> },
    { id: "action-btn", header: "", hideable: false, className: "text-right", cell: (e) => <Button size="sm" variant="secondary" onClick={() => setSelected(e)}>Ver</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-caption text-ink-2">
        <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
        Registro imutável de ações. Dados sensíveis (senhas, tokens, payloads) são sempre mascarados.
      </p>
      <FilterBar>
        <div className="w-52"><Combobox options={moduleOptions} value={module} onValueChange={setModule} /></div>
      </FilterBar>
      <DataTable data={filtered} columns={columns} getRowId={(e) => e.id} pageSize={8} empty={{ icon: ShieldCheck, title: "Nenhum evento de auditoria." }} />
      <AuditDetailSheet event={selected} onClose={() => setSelected(undefined)} />
    </div>
  );
}
