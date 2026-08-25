"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Globe, LayoutGrid, Mail, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { KPIBlock } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { ErrorState } from "@/components/ui/error-state";
import { formatNumber } from "@/lib/format";
import { useOrganizations } from "@/hooks/crm/use-organizations";
import { organizationSizeLabel, formatDate } from "@/lib/crm/display";
import type { ApiOrganization } from "@/types/api/crm";

const PAGE_SIZE = 20;

export function OrganizationsView() {
  const [view, setView] = React.useState<"table" | "cards">("cards");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, refetch, isFetching } = useOrganizations({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const items = data?.items ?? [];

  const columns: DataTableColumn<ApiOrganization>[] = [
    {
      id: "name",
      header: "Organização",
      cell: (o) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={o.name} type="company" size="sm" />
          <Link href={`/organizations/${o.id}`} className="font-medium text-ink hover:text-brand">{o.name}</Link>
        </div>
      ),
    },
    { id: "industry", header: "Segmento", cell: (o) => (o.industry ? <Badge tone="neutral" className="normal-case">{o.industry}</Badge> : "—") },
    { id: "size", header: "Porte", hideable: true, cell: (o) => (o.size ? organizationSizeLabel[o.size] : "—") },
    { id: "email", header: "E-mail", hideable: true, cell: (o) => <span className="text-ink-2">{o.email ?? "—"}</span> },
    { id: "created", header: "Criada em", hideable: true, cell: (o) => <span className="text-ink-2">{formatDate(o.createdAt)}</span> },
  ];

  if (isError) {
    return <ErrorState title="Não foi possível carregar as organizações." onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Organizações" value={formatNumber(data?.total ?? 0)} /></Card>
      </div>

      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar organizações…"
          containerClassName="w-full max-w-xs"
        />
        <SegmentedControl
          className="ml-auto"
          options={[
            { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> },
            { value: "table", label: "Tabela", icon: <Table2 className="size-4" /> },
          ]}
          value={view}
          onValueChange={setView}
        />
      </FilterBar>

      {view === "table" ? (
        <DataTable
          data={items}
          columns={columns}
          getRowId={(o) => o.id}
          loading={isLoading}
          pageSize={PAGE_SIZE}
          empty={{ icon: Building2, title: "Nenhuma organização encontrada." }}
        />
      ) : isLoading ? (
        <p className="py-10 text-center text-body2 text-ink-3">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-body2 text-ink-3">Nenhuma organização encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((o) => (
            <Card key={o.id} className="flex flex-col gap-4 p-5 transition-colors hover:border-brand/40">
              <div className="flex items-start gap-3">
                <EntityAvatar name={o.name} type="company" size="lg" />
                <div className="min-w-0 flex-1">
                  <Link href={`/organizations/${o.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">{o.name}</Link>
                  <p className="truncate text-caption text-ink-3">{[o.industry, o.size ? organizationSizeLabel[o.size] : null].filter(Boolean).join(" · ") || "—"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-t border-line pt-3 text-caption text-ink-2">
                {o.website ? <span className="flex items-center gap-1.5 truncate"><Globe className="size-3.5 text-ink-3" aria-hidden /> {o.website}</span> : null}
                {o.email ? <span className="flex items-center gap-1.5 truncate"><Mail className="size-3.5 text-ink-3" aria-hidden /> {o.email}</span> : null}
                {!o.website && !o.email ? <span className="text-ink-3">Sem contato cadastrado.</span> : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
