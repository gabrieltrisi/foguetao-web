"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Megaphone, Table2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar, ActiveFilters } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ChannelBadge, CampaignStatusBadge } from "@/components/marketing/badges";
import { formatCurrency, formatNumber } from "@/lib/format";
import { campaigns, campaignStatusLabel, objectiveLabel } from "@/mocks/marketing/campaigns";
import { channelLabels } from "@/mocks/marketing/performance";
import type { Campaign, CampaignStatus } from "@/types/marketing";
import { PreviewBanner } from "@/components/ui/preview-banner";

const STATUS_OPTIONS = [
  { value: "todas", label: "Todos os status" },
  { value: "ativa", label: "Ativa" },
  { value: "pausada", label: "Pausada" },
  { value: "encerrada", label: "Encerrada" },
  { value: "rascunho", label: "Rascunho" },
];
const CHANNEL_OPTIONS = [
  { value: "todos", label: "Todos os canais" },
  { value: "meta", label: "Meta" },
  { value: "google", label: "Google" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "E-mail" },
  { value: "afiliado", label: "Afiliado" },
];

export function CampaignsView() {
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("todas");
  const [channel, setChannel] = React.useState("todos");

  const filtered = campaigns.filter((c) => {
    const ms = status === "todas" || c.status === status;
    const mc = channel === "todos" || c.channel === channel;
    const q = query.trim().toLowerCase();
    return ms && mc && (!q || c.name.toLowerCase().includes(q));
  });

  const active = campaigns.filter((c) => c.status === "ativa");
  const invested = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const avgRoas = Math.round((campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length) * 10) / 10;

  const columns: DataTableColumn<Campaign>[] = [
    { id: "name", header: "Campanha", sortable: true, sortAccessor: (c) => c.name, cell: (c) => <Link href={`/campaigns/${c.id}`} className="font-medium text-ink hover:text-brand">{c.name}</Link> },
    { id: "channel", header: "Canal", cell: (c) => <ChannelBadge channel={c.channel} /> },
    { id: "objective", header: "Objetivo", defaultHidden: true, cell: (c) => objectiveLabel[c.objective] },
    { id: "status", header: "Status", cell: (c) => <CampaignStatusBadge status={c.status} /> },
    { id: "budget", header: "Orçamento", defaultHidden: true, className: "text-right tabular-nums", cell: (c) => formatCurrency(c.budget) },
    { id: "spent", header: "Investido", sortable: true, sortAccessor: (c) => c.spent, className: "text-right tabular-nums", cell: (c) => formatCurrency(c.spent) },
    { id: "leads", header: "Leads", sortable: true, sortAccessor: (c) => c.leads, className: "text-right tabular-nums", cell: (c) => formatNumber(c.leads) },
    { id: "cpl", header: "CPL", className: "text-right tabular-nums", cell: (c) => formatCurrency(c.cpl) },
    { id: "conv", header: "Conversões", defaultHidden: true, className: "text-right tabular-nums", cell: (c) => formatNumber(c.conversions) },
    { id: "revenue", header: "Receita", sortable: true, sortAccessor: (c) => c.revenue, className: "text-right tabular-nums", cell: (c) => formatCurrency(c.revenue) },
    { id: "roas", header: "ROAS", sortable: true, sortAccessor: (c) => c.roas, className: "text-right", cell: (c) => <span className={cn("font-semibold", c.roas >= 3 ? "text-success" : "text-ink")}>{c.roas}x</span> },
  ];

  const activeFilters = [
    ...(status !== "todas" ? [{ id: "status", label: "Status", value: campaignStatusLabel[status as CampaignStatus] }] : []),
    ...(channel !== "todos" ? [{ id: "channel", label: "Canal", value: channelLabels[channel as keyof typeof channelLabels] }] : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <PreviewBanner feature="Campanhas" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand"><Megaphone className="size-5" aria-hidden /></span><KPIBlock label="Ativas" value={formatNumber(active.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Investido" value={formatCurrency(invested)} delta="+8,2%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Leads" value={formatNumber(totalLeads)} delta="+14,8%" trend="up" /></Card>
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><TrendingUp className="size-5" aria-hidden /></span><KPIBlock label="ROAS médio" value={`${avgRoas}x`} /></Card>
      </div>

      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar campanhas…" containerClassName="w-full max-w-xs" />
        <div className="w-44"><Combobox options={CHANNEL_OPTIONS} value={channel} onValueChange={setChannel} /></div>
        <div className="w-44"><Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} /></div>
        <SegmentedControl className="ml-auto" options={[{ value: "table", label: "Tabela", icon: <Table2 className="size-4" /> }, { value: "cards", label: "Cards", icon: <LayoutGrid className="size-4" /> }]} value={view} onValueChange={setView} />
      </FilterBar>

      {activeFilters.length > 0 ? (
        <ActiveFilters filters={activeFilters} onRemove={(id) => (id === "status" ? setStatus("todas") : setChannel("todos"))} onClear={() => { setStatus("todas"); setChannel("todos"); }} />
      ) : null}

      {view === "table" ? (
        <DataTable data={filtered} columns={columns} getRowId={(c) => c.id} empty={{ icon: Megaphone, title: "Nenhuma campanha encontrada." }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          {filtered.length === 0 ? <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhuma campanha encontrada.</p> : null}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign: c }: { campaign: Campaign }) {
  const pct = Math.min(100, Math.round((c.spent / c.budget) * 100));
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/campaigns/${c.id}`} className="min-w-0 truncate font-display text-h3 font-semibold text-ink hover:text-brand">{c.name}</Link>
        <CampaignStatusBadge status={c.status} />
      </div>
      <ChannelBadge channel={c.channel} />
      <div>
        <div className="flex items-center justify-between text-caption text-ink-3"><span>Investido</span><span>{formatCurrency(c.spent)} / {formatCurrency(c.budget)}</span></div>
        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden><span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
        <div><p className="font-display text-body font-bold text-ink">{formatNumber(c.leads)}</p><p className="text-caption text-ink-3">Leads</p></div>
        <div><p className="font-display text-body font-bold text-ink">{formatCurrency(c.cpl)}</p><p className="text-caption text-ink-3">CPL</p></div>
        <div><p className="font-display text-body font-bold text-success">{c.roas}x</p><p className="text-caption text-ink-3">ROAS</p></div>
      </div>
    </Card>
  );
}
