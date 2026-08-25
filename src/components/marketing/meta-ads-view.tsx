"use client";

import { Activity, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdAccountCard } from "@/components/marketing/ad-account-card";
import { AdMetricsTable } from "@/components/marketing/ad-metrics-table";
import { formatNumber } from "@/lib/format";
import { metaAccounts, metaAdSets, metaAds, metaCampaigns, metaPages, metaPixel } from "@/mocks/marketing/meta-ads";
import { PreviewBanner } from "@/components/ui/preview-banner";

export function MetaAdsView() {
  return (
    <div className="flex flex-col gap-5">
      <PreviewBanner feature="A integração com Meta Ads" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metaAccounts.map((a) => <AdAccountCard key={a.id} account={a} />)}
      </div>

      <Tabs defaultValue="campanhas">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="conjuntos">Conjuntos</TabsTrigger>
          <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
          <TabsTrigger value="paginas">Páginas</TabsTrigger>
          <TabsTrigger value="pixel">Pixel</TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas"><AdMetricsTable rows={metaCampaigns} nameHeader="Campanha" /></TabsContent>
        <TabsContent value="conjuntos"><AdMetricsTable rows={metaAdSets} nameHeader="Conjunto de anúncios" /></TabsContent>
        <TabsContent value="anuncios"><AdMetricsTable rows={metaAds} nameHeader="Anúncio" /></TabsContent>

        <TabsContent value="paginas">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metaPages.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-brand">
                  <Share2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="text-caption text-ink-3">{p.type === "instagram" ? "Instagram" : "Facebook"} · {p.followers}</p>
                </div>
                <Badge tone={p.connected ? "success" : "neutral"} size="md">{p.connected ? "Conectada" : "Off"}</Badge>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pixel">
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Activity className="size-6" aria-hidden />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-h3 font-semibold text-ink">{metaPixel.name}</p>
                <Badge tone="success" size="md">Ativo</Badge>
              </div>
              <p className="text-caption text-ink-3">ID {metaPixel.id} · último evento {metaPixel.lastEvent}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-h1 font-bold text-ink">{formatNumber(metaPixel.eventsToday)}</p>
              <p className="text-caption text-ink-3">eventos hoje</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
