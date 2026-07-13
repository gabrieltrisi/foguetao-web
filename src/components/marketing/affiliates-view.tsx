"use client";

import * as React from "react";
import Link from "next/link";
import { Award, DollarSign, Trophy, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/business/badges";
import { AffiliateRanking } from "@/components/marketing/affiliate-ranking";
import { formatCurrency, formatNumber } from "@/lib/format";
import { affiliates, affiliateStatusLabel, affiliateStatusTone } from "@/mocks/marketing/affiliates";
import type { Affiliate } from "@/types/marketing";

export function AffiliatesView() {
  const totalRevenue = affiliates.reduce((s, a) => s + a.revenue, 0);
  const totalCommission = affiliates.reduce((s, a) => s + a.commission, 0);
  const totalSales = affiliates.reduce((s, a) => s + a.sales, 0);

  const columns: DataTableColumn<Affiliate>[] = [
    {
      id: "name", header: "Afiliado", sortable: true, sortAccessor: (a) => a.name,
      cell: (a) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={a.name} size="sm" />
          <div className="min-w-0">
            <Link href={`/affiliates/${a.id}`} className="block truncate font-medium text-ink hover:text-brand">{a.name}</Link>
            <p className="truncate text-caption text-ink-3">{a.code}</p>
          </div>
        </div>
      ),
    },
    { id: "tier", header: "Nível", cell: (a) => <Badge tone="neutral" className="normal-case">{a.tier}</Badge> },
    { id: "clicks", header: "Cliques", className: "text-right tabular-nums", cell: (a) => formatNumber(a.clicks) },
    { id: "leads", header: "Leads", className: "text-right tabular-nums", cell: (a) => formatNumber(a.leads) },
    { id: "sales", header: "Vendas", sortable: true, sortAccessor: (a) => a.sales, className: "text-right tabular-nums", cell: (a) => formatNumber(a.sales) },
    { id: "conv", header: "Conversão", className: "text-right tabular-nums", cell: (a) => `${a.conversion}%` },
    { id: "revenue", header: "Receita", sortable: true, sortAccessor: (a) => a.revenue, className: "text-right tabular-nums", cell: (a) => formatCurrency(a.revenue) },
    { id: "commission", header: "Comissão", className: "text-right tabular-nums", cell: (a) => formatCurrency(a.commission) },
    { id: "status", header: "Status", cell: (a) => <StatusBadge tone={affiliateStatusTone[a.status]}>{affiliateStatusLabel[a.status]}</StatusBadge> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand"><Users className="size-5" aria-hidden /></span><KPIBlock label="Afiliados" value={formatNumber(affiliates.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Vendas" value={formatNumber(totalSales)} delta="+11%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Receita gerada" value={formatCurrency(totalRevenue)} delta="+15%" trend="up" /></Card>
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><DollarSign className="size-5" aria-hidden /></span><KPIBlock label="Comissões" value={formatCurrency(totalCommission)} /></Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <p className="mb-4 flex items-center gap-2 font-display text-h3 font-semibold text-ink"><Trophy className="size-4 text-warning" aria-hidden /> Ranking</p>
          <AffiliateRanking affiliates={affiliates} />
        </Card>
        <div className="lg:col-span-2">
          <p className="mb-3 flex items-center gap-2 font-display text-h3 font-semibold text-ink"><Award className="size-4 text-ink-2" aria-hidden /> Todos os afiliados</p>
          <DataTable data={affiliates} columns={columns} getRowId={(a) => a.id} searchAccessor={(a) => `${a.name} ${a.code}`} searchPlaceholder="Buscar afiliado…" pageSize={6} empty={{ icon: Users, title: "Nenhum afiliado." }} />
        </div>
      </div>
    </div>
  );
}
