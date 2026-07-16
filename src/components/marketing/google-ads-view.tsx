"use client";

import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdAccountCard } from "@/components/marketing/ad-account-card";
import { AdMetricsTable } from "@/components/marketing/ad-metrics-table";
import { formatCurrency, formatNumber } from "@/lib/format";
import { googleAccounts, googleAds, googleCampaigns, googleConversions, googleGroups, googleKeywords } from "@/mocks/marketing/google-ads";
import { PreviewBanner } from "@/components/ui/preview-banner";

export function GoogleAdsView() {
  return (
    <div className="flex flex-col gap-5">
      <PreviewBanner feature="A integração com Google Ads" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {googleAccounts.map((a) => <AdAccountCard key={a.id} account={a} />)}
      </div>

      <Tabs defaultValue="campanhas">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
          <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
          <TabsTrigger value="palavras">Palavras-chave</TabsTrigger>
          <TabsTrigger value="conversoes">Conversões</TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas"><AdMetricsTable rows={googleCampaigns} nameHeader="Campanha" /></TabsContent>
        <TabsContent value="grupos"><AdMetricsTable rows={googleGroups} nameHeader="Grupo de anúncios" /></TabsContent>
        <TabsContent value="anuncios"><AdMetricsTable rows={googleAds} nameHeader="Anúncio" /></TabsContent>

        <TabsContent value="palavras">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead>Correspondência</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {googleKeywords.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.keyword}</TableCell>
                    <TableCell><Badge tone="neutral" className="normal-case">{k.match}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(k.clicks)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(k.impressions)}</TableCell>
                    <TableCell className="text-right tabular-nums">{k.ctr}%</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(k.cpc)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(k.conversions)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabsContent>

        <TabsContent value="conversoes">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {googleConversions.map((c) => (
              <Card key={c.id} className="flex flex-col gap-2 p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success"><Target className="size-4" aria-hidden /></span>
                <p className="text-caption text-ink-3">{c.name}</p>
                <p className="font-display text-h2 font-bold text-ink">{formatNumber(c.count)}</p>
                {c.value > 0 ? <p className="text-caption text-success">{formatCurrency(c.value)}</p> : <p className="text-caption text-ink-3">—</p>}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
