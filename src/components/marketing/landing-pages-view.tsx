"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { LandingPageCard } from "@/components/marketing/landing-page-card";
import { formatNumber } from "@/lib/format";
import { landingPages } from "@/mocks/marketing/landing-pages";
import { PreviewBanner } from "@/components/ui/preview-banner";

export function LandingPagesView() {
  const [query, setQuery] = React.useState("");
  const filtered = landingPages.filter((p) => !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()));

  const views = landingPages.reduce((s, p) => s + p.views, 0);
  const leads = landingPages.reduce((s, p) => s + p.leads, 0);
  const avgConv = Math.round((landingPages.reduce((s, p) => s + p.conversion, 0) / landingPages.length) * 10) / 10;

  return (
    <div className="flex flex-col gap-5">
      <PreviewBanner feature="Landing pages" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5"><KPIBlock label="Páginas" value={formatNumber(landingPages.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Visualizações" value={formatNumber(views)} delta="+9,4%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Leads" value={formatNumber(leads)} delta="+12,1%" trend="up" /></Card>
        <Card className="p-5"><KPIBlock label="Conversão média" value={`${avgConv}%`} /></Card>
      </div>

      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar páginas…" containerClassName="w-full max-w-xs" />
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => <LandingPageCard key={p.id} page={p} />)}
        {filtered.length === 0 ? <p className="col-span-full py-10 text-center text-body2 text-ink-3">Nenhuma página encontrada.</p> : null}
      </div>
    </div>
  );
}
