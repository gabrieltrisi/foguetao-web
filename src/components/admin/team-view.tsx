"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useToast } from "@/components/ui/toast";
import { teamMembers, memberStatusLabel, memberStatusTone } from "@/mocks/admin/team";
import { roles } from "@/mocks/admin/roles";
import type { TeamMember } from "@/types/admin";

export function TeamView() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState("Todos");

  const roleOptions = [{ value: "Todos", label: "Todos os papéis" }, ...roles.map((r) => ({ value: r.name, label: r.name }))];
  const filtered = teamMembers.filter(
    (m) =>
      (role === "Todos" || m.role === role) &&
      (m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())),
  );

  const columns: DataTableColumn<TeamMember>[] = [
    {
      id: "name",
      header: "Usuário",
      cell: (m) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={m.name} size="sm" />
          <div className="min-w-0">
            <Link href={`/team/${m.id}`} className="block truncate font-medium text-ink hover:text-brand focus-visible:outline-none focus-visible:underline">{m.name}</Link>
            <p className="truncate text-caption text-ink-3">{m.email}</p>
          </div>
        </div>
      ),
    },
    { id: "role", header: "Cargo", cell: (m) => <Badge tone="neutral" className="normal-case">{m.role}</Badge> },
    { id: "company", header: "Empresa", hideable: true, cell: (m) => <span className="text-ink-2">{m.company}</span> },
    { id: "lastAccess", header: "Último acesso", hideable: true, cell: (m) => <span className="text-ink-2">{m.lastAccess}</span> },
    { id: "status", header: "Status", cell: (m) => <Badge tone={memberStatusTone[m.status]}>{memberStatusLabel[m.status]}</Badge> },
    {
      id: "twoFactor",
      header: "2FA",
      cell: (m) =>
        m.twoFactor ? (
          <span className="inline-flex items-center gap-1 text-caption font-medium text-success"><ShieldCheck className="size-4" aria-hidden /> Ativo</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-caption text-ink-3"><ShieldOff className="size-4" aria-hidden /> Inativo</span>
        ),
    },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: (m) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild size="sm" variant="ghost" aria-label={`Editar ${m.name}`}>
            <Link href={`/team/${m.id}`}><Pencil className="size-4" aria-hidden /></Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast({ title: `Excluir ${m.name} (mock)`, variant: "error" })} aria-label={`Excluir ${m.name}`}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou e-mail…" className="sm:max-w-xs" />
        <div className="w-48"><Combobox options={roleOptions} value={role} onValueChange={setRole} /></div>
        <Button asChild size="sm" className="sm:ml-auto">
          <Link href="/team/new"><Plus className="size-4" aria-hidden /> Criar usuário</Link>
        </Button>
      </FilterBar>
      <DataTable data={filtered} columns={columns} getRowId={(m) => m.id} pageSize={8} empty={{ icon: Users, title: "Nenhum usuário encontrado." }} />
    </div>
  );
}
