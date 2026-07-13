"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, LayoutGrid, Table2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { KPIBlock } from "@/components/business/kpi-block";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { OwnerBadge, StatusBadge } from "@/components/business/badges";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import { organizations, orgStatusLabel, orgStatusTone } from "@/mocks/crm/organizations";
import type { Organization } from "@/types/crm";

export function OrganizationsView() {
  const [view, setView] = React.useState<"table" | "cards">("cards");
  const [query, setQuery] = React.useState("");

  const filtered = organizations.filter((o) => {
    const q = query.trim().toLowerCase();
    return !q || `${o.name} ${o.segment} ${o.owner}`.toLowerCase().includes(q);
  });

  const totalRevenue = organizations.reduce((s, o) => s + o.revenue, 0);
  const totalContacts = organizations.reduce((s, o) => s + o.contactsCount, 0);
  const totalDeals = organizations.reduce((s, o) => s + o.dealsCount, 0);

  const columns: DataTableColumn<Organization>[] = [
    {
      id: "name",
      header: "Organização",
      sortable: true,
      sortAccessor: (o) => o.name,
      cell: (o) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={o.name} type="company" size="sm" />
          <Link href={`/organizations/${o.id}`} className="font-medium text-ink hover:text-brand">
            {o.name}
          </Link>
        </div>
      ),
    },
    { id: "segment", header: "Segmento", cell: (o) => <Badge tone="neutral" className="normal-case">{o.segment}</Badge> },
    { id: "owner", header: "Responsável", cell: (o) => <OwnerBadge name={o.owner} /> },
    { id: "contacts", header: "Contatos", cell: (o) => formatNumber(o.contactsCount) },
    { id: "deals", header: "Deals", cell: (o) => formatNumber(o.dealsCount) },
    {
      id: "revenue",
      header: "Receita",
      sortable: true,
      sortAccessor: (o) => o.revenue,
      className: "text-right tabular-nums",
      cell: (o) => formatCurrency(o.revenue),
    },
    { id: "status", header: "Status", cell: (o) => <StatusBadge tone={orgStatusTone[o.status]}>{orgStatusLabel[o.status]}</StatusBadge> },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Organizações" value={formatNumber(organizations.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Receita total" value={formatCurrency(totalRevenue)} delta="+9,4%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Contatos" value={formatNumber(totalContacts)} /></Card>
        <Card className="p-5"><KPIBlock label="Deals" value={formatNumber(totalDeals)} /></Card>
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
          data={filtered}
          columns={columns}
          getRowId={(o) => o.id}
          empty={{ icon: Building2, title: "Nenhuma organização encontrada." }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <Card key={o.id} className="flex flex-col gap-4 p-5 transition-colors hover:border-brand/40">
              <div className="flex items-start gap-3">
                <EntityAvatar name={o.name} type="company" size="lg" />
                <div className="min-w-0 flex-1">
                  <Link href={`/organizations/${o.id}`} className="block truncate font-display text-h3 font-semibold text-ink hover:text-brand">
                    {o.name}
                  </Link>
                  <p className="truncate text-caption text-ink-3">{o.segment} · {o.location}</p>
                </div>
                <StatusBadge tone={orgStatusTone[o.status]}>{orgStatusLabel[o.status]}</StatusBadge>
              </div>
              <div className="grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
                <div>
                  <p className="font-display text-h3 font-bold text-ink">{formatNumber(o.contactsCount)}</p>
                  <p className="text-caption text-ink-3">Contatos</p>
                </div>
                <div>
                  <p className="font-display text-h3 font-bold text-ink">{formatNumber(o.dealsCount)}</p>
                  <p className="text-caption text-ink-3">Deals</p>
                </div>
                <div>
                  <p className="font-display text-h3 font-bold text-ink">{(o.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-caption text-ink-3">Receita</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <OwnerBadge name={o.owner} />
                <span className="inline-flex items-center gap-1 text-caption text-ink-3">
                  <Users className="size-3.5" aria-hidden /> {formatNumber(o.contactsCount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
