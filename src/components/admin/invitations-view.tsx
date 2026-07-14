"use client";

import * as React from "react";
import { Mail, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";
import { invitations, invitationStatusLabel, invitationStatusTone } from "@/mocks/admin/invitations";
import type { Invitation, InvitationStatus } from "@/types/admin";

type Filter = "todos" | InvitationStatus;

export function InvitationsView() {
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<Filter>("todos");

  const filtered = invitations.filter((i) => filter === "todos" || i.status === filter);

  const columns: DataTableColumn<Invitation>[] = [
    { id: "email", header: "E-mail", cell: (i) => (
      <span className="inline-flex items-center gap-2 font-medium text-ink"><Mail className="size-4 text-ink-3" aria-hidden /> {i.email}</span>
    ) },
    { id: "role", header: "Papel", cell: (i) => <Badge tone="neutral" className="normal-case">{i.role}</Badge> },
    { id: "invitedBy", header: "Convidado por", hideable: true, cell: (i) => <span className="text-ink-2">{i.invitedBy}</span> },
    { id: "sentAt", header: "Enviado", hideable: true, cell: (i) => <span className="text-ink-2">{i.sentAt}</span> },
    { id: "expiresAt", header: "Expira", cell: (i) => <span className="text-ink-2">{i.expiresAt}</span> },
    { id: "status", header: "Status", cell: (i) => <Badge tone={invitationStatusTone[i.status]}>{invitationStatusLabel[i.status]}</Badge> },
    { id: "actions", header: "", hideable: false, className: "text-right", cell: (i) => (
      i.status === "accepted" ? <span className="text-caption text-ink-3">—</span> : (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => toast({ title: `Convite reenviado para ${i.email} (mock)`, variant: "success" })} aria-label="Reenviar">
            <RefreshCw className="size-4" aria-hidden />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast({ title: `Convite cancelado (mock)` })} aria-label="Cancelar">
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      )
    ) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SegmentedControl<Filter>
          options={[
            { value: "todos", label: "Todos" },
            { value: "pending", label: "Pendentes" },
            { value: "expired", label: "Expirados" },
            { value: "accepted", label: "Aceitos" },
          ]}
          value={filter}
          onValueChange={setFilter}
        />
        <Button size="sm" className="sm:ml-auto" onClick={() => toast({ title: "Novo convite (mock)" })}>
          <Plus className="size-4" aria-hidden /> Convidar
        </Button>
      </FilterBar>
      <DataTable data={filtered} columns={columns} getRowId={(i) => i.id} pageSize={8} empty={{ icon: Mail, title: "Nenhum convite." }} />
    </div>
  );
}
