"use client";

import * as React from "react";
import { LayoutGrid, Table2, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { ChannelBadge } from "@/components/marketing/badges";
import { MetricComparison } from "@/components/marketing/comparison";
import { formatCurrency, formatNumber } from "@/lib/format";
import { leadSources } from "@/mocks/marketing/lead-sources";
import type { LeadSource } from "@/types/marketing";

export function LeadSourcesView() {
  const [view, setView] = React.useState<"table" | "cards">("table");

  const columns: DataTableColumn<LeadSource>[] = [
    { id: "name", header: "Origem", sortable: true, sortAccessor: (s) => s.name, cell: (s) => <ChannelBadge channel={s.channel} /> },
    { id: "leads", header: "Leads", sortable: true, sortAccessor: (s) => s.leads, className: "text-right tabular-nums", cell: (s) => formatNumber(s.leads) },
    { id: "conv", header: "Conversão", className: "text-right tabular-nums", cell: (s) => `${s.conversion}%` },
    { id: "cpl", header: "CPL", className: "text-right tabular-nums", cell: (s) => (s.cpl > 0 ? formatCurrency(s.cpl) : "—") },
    { id: "revenue", header: "Receita", sortable: true, sortAccessor: (s) => s.revenue, className: "text-right tabular-nums", cell: (s) => formatCurrency(s.revenue) },
    { id: "trend", header: "Tendência", className: "text-right", cell: (s) => <TrendIndicator value={s.delta} trend={s.trend} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5">
        <p className="mb-4 font-display text-h3 font-semibold text-ink">Leads por origem</p>
        <MetricComparison items={leadSources.map((s) => ({ id: s.id, label: s.name, barValue: s.leads, value: formatNumber(s.leads), sub: `${s.conversion}%` }))} />
      </Card>

      <FilterBar>
        <SegmentedControl className="ml-auto" options={[{ value: "table", label: "Tabela", icon: <Table2 className="size-4" /> }, { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> }]} value={view} onValueChange={setView} />
      </FilterBar>

      {view === "table" ? (
        <DataTable data={leadSources} columns={columns} getRowId={(s) => s.id} empty={{ icon: Workflow, title: "Sem origens." }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {leadSources.map((s) => (
            <Card key={s.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <ChannelBadge channel={s.channel} />
                <TrendIndicator value={s.delta} trend={s.trend} />
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                <div><p className="font-display text-body font-bold text-ink">{formatNumber(s.leads)}</p><p className="text-caption text-ink-3">Leads</p></div>
                <div><p className="font-display text-body font-bold text-ink">{s.conversion}%</p><p className="text-caption text-ink-3">Conv.</p></div>
                <div><p className="font-display text-body font-bold text-ink">{formatCurrency(s.revenue).replace("R$ ", "")}</p><p className="text-caption text-ink-3">Receita</p></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
