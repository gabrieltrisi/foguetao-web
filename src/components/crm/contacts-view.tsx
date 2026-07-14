"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Mail, Phone, Table2, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { StatusBadge } from "@/components/business/badges";
import { useToast } from "@/components/ui/toast";
import { useContacts, useDeleteContact } from "@/hooks/crm/use-contacts";
import { useOrganizations } from "@/hooks/crm/use-organizations";
import { contactStatusMeta, contactStatusOptions, formatDate } from "@/lib/crm/display";
import type { ApiContact } from "@/types/api/crm";

const PAGE_SIZE = 20;

export function ContactsView() {
  const { toast } = useToast();
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [status, setStatus] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [confirmIds, setConfirmIds] = React.useState<string[] | null>(null);

  // Debounce da busca (server-side).
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useContacts({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const orgs = useOrganizations({ limit: 100 });
  const orgName = React.useMemo(() => {
    const map = new Map<string, string>();
    orgs.data?.items.forEach((o) => map.set(o.id, o.name));
    return map;
  }, [orgs.data]);

  const del = useDeleteContact();
  const items = data?.items ?? [];

  const columns: DataTableColumn<ApiContact>[] = [
    {
      id: "name",
      header: "Contato",
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={c.fullName} size="sm" />
          <div className="min-w-0">
            <Link href={`/contacts/${c.id}`} className="block truncate font-medium text-ink hover:text-brand">
              {c.fullName}
            </Link>
            {c.jobTitle ? <p className="truncate text-caption text-ink-3">{c.jobTitle}</p> : null}
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contato",
      cell: (c) => (
        <div className="min-w-0 text-caption text-ink-2">
          {c.email ? <p className="flex items-center gap-1 truncate"><Mail className="size-3 shrink-0 text-ink-3" aria-hidden /> {c.email}</p> : null}
          {c.phone ? <p className="mt-0.5 flex items-center gap-1 truncate"><Phone className="size-3 shrink-0 text-ink-3" aria-hidden /> {c.phone}</p> : null}
        </div>
      ),
    },
    { id: "organization", header: "Organização", hideable: true, cell: (c) => (c.organizationId ? orgName.get(c.organizationId) ?? "—" : "—") },
    { id: "status", header: "Status", cell: (c) => <StatusBadge tone={contactStatusMeta[c.status].tone}>{contactStatusMeta[c.status].label}</StatusBadge> },
    { id: "last", header: "Última interação", hideable: true, cell: (c) => <span className="text-ink-2">{formatDate(c.lastActivityAt)}</span> },
  ];

  if (isError) {
    return (
      <ErrorState title="Não foi possível carregar os contatos." onRetry={() => refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar contatos…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-44">
          <Combobox
            options={contactStatusOptions.map((o) => ({ value: o.value || "todos", label: o.label }))}
            value={status || "todos"}
            onValueChange={(v) => {
              setStatus(v === "todos" ? "" : v);
              setPage(1);
            }}
          />
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

      {view === "table" ? (
        <DataTable
          data={items}
          columns={columns}
          getRowId={(c) => c.id}
          loading={isLoading}
          pageSize={PAGE_SIZE}
          selectable
          empty={{ icon: Users, title: "Nenhum contato encontrado.", description: "Ajuste os filtros ou crie um novo contato." }}
          bulkActions={(ids) => (
            <Button size="sm" variant="danger" onClick={() => setConfirmIds(ids)} aria-label={`Excluir ${ids.length}`}>
              <Trash2 />
              Excluir
            </Button>
          )}
        />
      ) : isLoading ? (
        <p className="py-10 text-center text-body2 text-ink-3">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-body2 text-ink-3">Nenhum contato encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <ContactCard key={c.id} contact={c} orgName={c.organizationId ? orgName.get(c.organizationId) : undefined} />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmIds !== null}
        onOpenChange={(o) => !o && setConfirmIds(null)}
        title="Excluir contatos?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          const ids = confirmIds ?? [];
          try {
            await Promise.all(ids.map((id) => del.mutateAsync(id)));
            toast({ title: `${ids.length} contato(s) excluído(s)`, variant: "success" });
          } catch {
            toast({ title: "Falha ao excluir contatos", variant: "error" });
          }
          setConfirmIds(null);
        }}
      />
    </div>
  );
}

function ContactCard({ contact: c, orgName }: { contact: ApiContact; orgName?: string }) {
  return (
    <Card className="flex flex-col gap-3 p-4 transition-colors hover:border-brand/40">
      <div className="flex items-start gap-3">
        <EntityAvatar name={c.fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <Link href={`/contacts/${c.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">
            {c.fullName}
          </Link>
          <p className="truncate text-caption text-ink-3">
            {[c.jobTitle, orgName].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <StatusBadge tone={contactStatusMeta[c.status].tone}>{contactStatusMeta[c.status].label}</StatusBadge>
      </div>
      <div className="flex flex-col gap-1 text-caption text-ink-2">
        {c.email ? <span className="flex items-center gap-1.5 truncate"><Mail className="size-3.5 text-ink-3" aria-hidden /> {c.email}</span> : null}
        {c.phone ? <span className="flex items-center gap-1.5 truncate"><Phone className="size-3.5 text-ink-3" aria-hidden /> {c.phone}</span> : null}
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3 text-caption text-ink-3">
        <span>Criado {formatDate(c.createdAt)}</span>
        <span>{formatDate(c.lastActivityAt)}</span>
      </div>
    </Card>
  );
}
