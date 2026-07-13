"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Mail, Phone, Table2, Trash2, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar, ActiveFilters, SavedViewSelector } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { OwnerBadge, StatusBadge } from "@/components/business/badges";
import { TagList } from "@/components/crm/tags";
import { useToast } from "@/components/ui/toast";
import { contacts, contactStatusLabel, contactStatusTone } from "@/mocks/crm/contacts";
import type { Contact, ContactStatus } from "@/types/crm";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "lead", label: "Lead" },
  { value: "ativo", label: "Ativo" },
  { value: "cliente", label: "Cliente" },
  { value: "inativo", label: "Inativo" },
];

export function ContactsView() {
  const { toast } = useToast();
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [status, setStatus] = React.useState("todos");
  const [query, setQuery] = React.useState("");
  const [savedView, setSavedView] = React.useState("todos");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const filtered = contacts.filter((c) => {
    const matchStatus = status === "todos" || c.status === status;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      `${c.name} ${c.email} ${c.organizationName} ${c.owner}`.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const columns: DataTableColumn<Contact>[] = [
    {
      id: "name",
      header: "Contato",
      sortable: true,
      sortAccessor: (c) => c.name,
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={c.name} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/contacts/${c.id}`}
              className="block truncate font-medium text-ink hover:text-brand"
            >
              {c.name}
            </Link>
            <p className="truncate text-caption text-ink-3">{c.role}</p>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contato",
      cell: (c) => (
        <div className="min-w-0 text-caption text-ink-2">
          <p className="flex items-center gap-1 truncate">
            <Mail className="size-3 shrink-0 text-ink-3" aria-hidden /> {c.email}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate">
            <Phone className="size-3 shrink-0 text-ink-3" aria-hidden /> {c.phone}
          </p>
        </div>
      ),
    },
    { id: "organization", header: "Organização", cell: (c) => c.organizationName },
    { id: "owner", header: "Responsável", cell: (c) => <OwnerBadge name={c.owner} /> },
    {
      id: "status",
      header: "Status",
      cell: (c) => <StatusBadge tone={contactStatusTone[c.status]}>{contactStatusLabel[c.status]}</StatusBadge>,
    },
    { id: "tags", header: "Tags", cell: (c) => <TagList tags={c.tags} max={2} />, hideable: true },
    { id: "last", header: "Última interação", cell: (c) => <span className="text-ink-2">{c.lastInteraction}</span> },
  ];

  const activeFilters = status !== "todos"
    ? [{ id: "status", label: "Status", value: contactStatusLabel[status as ContactStatus] }]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar contatos…"
          containerClassName="w-full max-w-xs"
        />
        <SavedViewSelector
          views={[
            { id: "todos", label: "Todos os contatos" },
            { id: "meus", label: "Meus contatos" },
            { id: "clientes", label: "Clientes" },
          ]}
          value={savedView}
          onValueChange={setSavedView}
        />
        <div className="w-44">
          <Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
        </div>
        <SegmentedControl
          className="ml-auto"
          options={[
            { value: "table", label: "Tabela", icon: <Table2 className="size-4" /> },
            { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> },
          ]}
          value={view}
          onValueChange={setView}
        />
      </FilterBar>

      {activeFilters.length > 0 ? (
        <ActiveFilters filters={activeFilters} onRemove={() => setStatus("todos")} onClear={() => setStatus("todos")} />
      ) : null}

      {view === "table" ? (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(c) => c.id}
          selectable
          empty={{ icon: Users, title: "Nenhum contato encontrado.", description: "Ajuste os filtros ou crie um novo contato." }}
          bulkActions={(ids) => (
            <>
              <Button size="sm" variant="secondary">
                <UserPlus />
                Atribuir
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)} aria-label={`Excluir ${ids.length}`}>
                <Trash2 />
                Excluir
              </Button>
            </>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
          {filtered.length === 0 ? (
            <p className="col-span-full py-10 text-center text-body2 text-ink-3">
              Nenhum contato encontrado.
            </p>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir contatos?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => toast({ title: "Contatos excluídos (mock)", variant: "success" })}
      />
    </div>
  );
}

function ContactCard({ contact: c }: { contact: Contact }) {
  return (
    <Card className={cn("flex flex-col gap-3 p-4 transition-colors hover:border-brand/40")}>
      <div className="flex items-start gap-3">
        <EntityAvatar name={c.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link href={`/contacts/${c.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">
            {c.name}
          </Link>
          <p className="truncate text-caption text-ink-3">{c.role} · {c.organizationName}</p>
        </div>
        <StatusBadge tone={contactStatusTone[c.status]}>{contactStatusLabel[c.status]}</StatusBadge>
      </div>
      <div className="flex flex-col gap-1 text-caption text-ink-2">
        <span className="flex items-center gap-1.5 truncate"><Mail className="size-3.5 text-ink-3" aria-hidden /> {c.email}</span>
        <span className="flex items-center gap-1.5 truncate"><Phone className="size-3.5 text-ink-3" aria-hidden /> {c.phone}</span>
      </div>
      <TagList tags={c.tags} max={3} />
      <div className="flex items-center justify-between border-t border-line pt-3">
        <OwnerBadge name={c.owner} />
        <span className="text-caption text-ink-3">{c.lastInteraction}</span>
      </div>
    </Card>
  );
}
