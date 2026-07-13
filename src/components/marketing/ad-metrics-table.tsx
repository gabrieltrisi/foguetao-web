"use client";

import { Megaphone } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { CampaignStatusBadge } from "@/components/marketing/badges";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AdRow } from "@/types/marketing";

/** Tabela genérica de métricas de anúncios (campanhas/conjuntos/anúncios/grupos). */
export function AdMetricsTable({ rows, nameHeader = "Nome" }: { rows: AdRow[]; nameHeader?: string }) {
  const columns: DataTableColumn<AdRow>[] = [
    { id: "name", header: nameHeader, sortable: true, sortAccessor: (r) => r.name, cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { id: "status", header: "Status", cell: (r) => <CampaignStatusBadge status={r.status} /> },
    { id: "spend", header: "Investido", sortable: true, sortAccessor: (r) => r.spend, className: "text-right tabular-nums", cell: (r) => formatCurrency(r.spend) },
    { id: "impressions", header: "Impressões", className: "text-right tabular-nums", cell: (r) => formatNumber(r.impressions) },
    { id: "clicks", header: "Cliques", sortable: true, sortAccessor: (r) => r.clicks, className: "text-right tabular-nums", cell: (r) => formatNumber(r.clicks) },
    { id: "ctr", header: "CTR", className: "text-right tabular-nums", cell: (r) => `${r.ctr}%` },
    { id: "cpc", header: "CPC", className: "text-right tabular-nums", cell: (r) => formatCurrency(r.cpc) },
    { id: "conversions", header: "Conversões", sortable: true, sortAccessor: (r) => r.conversions, className: "text-right tabular-nums", cell: (r) => formatNumber(r.conversions) },
  ];
  return <DataTable data={rows} columns={columns} getRowId={(r) => r.id} pageSize={8} empty={{ icon: Megaphone, title: "Nada por aqui." }} />;
}
