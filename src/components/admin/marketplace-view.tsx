"use client";

import * as React from "react";
import { Star, Download, Eye, Check, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";
import { marketplaceItems, marketplaceCategories } from "@/mocks/admin/marketplace";
import type { MarketplaceItem } from "@/types/admin";

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const { toast } = useToast();
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="relative flex h-28 items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}CC)` }}>
        <Package className="size-10 text-white/90" aria-hidden />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-micro font-semibold text-ink">{item.priceLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="neutral" className="normal-case">{item.category}</Badge>
          <span className="inline-flex items-center gap-1 text-caption font-medium text-ink"><Star className="size-3.5 fill-warning text-warning" aria-hidden /> {item.rating.toFixed(1)}</span>
        </div>
        <p className="font-medium text-ink">{item.title}</p>
        <p className="text-caption text-ink-3">por {item.author}</p>
        <p className="inline-flex items-center gap-1 text-caption text-ink-3"><Download className="size-3.5" aria-hidden /> {formatNumber(item.downloads)} instalações</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant={item.installed ? "secondary" : "primary"}
            className="flex-1"
            disabled={item.installed}
            onClick={() => toast({ title: `Instalando ${item.title}… (mock)`, variant: "success" })}
          >
            {item.installed ? <><Check className="size-4" aria-hidden /> Instalado</> : "Instalar"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast({ title: `Preview de ${item.title} (mock)` })} aria-label={`Preview de ${item.title}`}>
            <Eye className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MarketplaceView() {
  const [category, setCategory] = React.useState("Todos");
  const [query, setQuery] = React.useState("");

  const filtered = marketplaceItems.filter(
    (i) => (category === "Todos" || i.category === category) && i.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar no marketplace…" className="sm:max-w-sm" />
      <div className="no-scrollbar overflow-x-auto">
        <SegmentedControl
          options={marketplaceCategories.map((c) => ({ value: c, label: c }))}
          value={category}
          onValueChange={setCategory}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((i) => <MarketplaceCard key={i.id} item={i} />)}
      </div>
    </div>
  );
}
