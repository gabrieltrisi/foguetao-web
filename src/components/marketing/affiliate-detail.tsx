"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { StatusBadge } from "@/components/business/badges";
import { CommissionStatusBadge } from "@/components/marketing/badges";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DetailPageLayout } from "@/components/patterns/page-patterns";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/format";
import { affiliateStatusLabel, affiliateStatusTone, commissions } from "@/mocks/marketing/affiliates";
import type { Affiliate } from "@/types/marketing";

export function AffiliateDetail({ affiliate: a }: { affiliate: Affiliate }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const link = `https://foguetao.com.br/?ref=${a.code}`;
  const affCommissions = commissions.filter((c) => c.affiliate === a.name);

  const copy = async () => {
    try { await navigator.clipboard?.writeText(link); } catch {}
    setCopied(true);
    toast({ title: "Link copiado", variant: "success" });
    window.setTimeout(() => setCopied(false), 1500);
  };

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <KPIBlock label="Comissão acumulada" value={formatCurrency(a.commission)} delta={`${a.sales} vendas`} trend="up" />
        <div className="mt-4"><StatusBadge tone={affiliateStatusTone[a.status]}>{affiliateStatusLabel[a.status]}</StatusBadge></div>
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Detalhes</p>
        <StatList
          items={[
            { label: "Código", value: a.code },
            { label: "Nível", value: a.tier },
            { label: "Cliques", value: formatNumber(a.clicks) },
            { label: "Conversão", value: `${a.conversion}%` },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={a.name}
      subtitle={`${a.tier} · ${a.code}`}
      back={{ href: "/affiliates", label: "Afiliados" }}
      actions={<Button size="sm" onClick={copy}>{copied ? <Check /> : <Link2 />}{copied ? "Copiado!" : "Copiar link"}</Button>}
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="link">Link</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card className="p-4"><KPIBlock label="Cliques" value={formatNumber(a.clicks)} /></Card>
            <Card className="p-4"><KPIBlock label="Leads" value={formatNumber(a.leads)} /></Card>
            <Card className="p-4"><KPIBlock label="Vendas" value={formatNumber(a.sales)} /></Card>
            <Card className="p-4"><KPIBlock label="Conversão" value={`${a.conversion}%`} /></Card>
            <Card className="p-4"><KPIBlock label="Receita" value={formatCurrency(a.revenue)} /></Card>
            <Card className="p-4"><KPIBlock label="Comissão" value={formatCurrency(a.commission)} /></Card>
          </div>
        </TabsContent>

        <TabsContent value="comissoes">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affCommissions.length === 0 ? (
                  <TableRow className="hover:bg-transparent"><TableCell colSpan={4} className="py-8 text-center text-ink-3">Nenhuma comissão no período.</TableCell></TableRow>
                ) : (
                  affCommissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.date}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.saleValue)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(c.amount)}</TableCell>
                      <TableCell><CommissionStatusBadge status={c.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabsContent>

        <TabsContent value="link">
          <Card className="p-5">
            <p className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-3"><Link2 className="size-3.5" aria-hidden /> Link de afiliado</p>
            <p className="break-all rounded-lg border border-line bg-surface p-3 text-body2 text-ink">{link}</p>
            <Button size="sm" className="mt-3" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copiado!" : "Copiar link"}</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
