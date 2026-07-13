"use client";

import * as React from "react";
import { CirclePause, CirclePlay, Megaphone, Pencil, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
import { Timeline } from "@/components/business/timeline";
import { DetailPageLayout, DashboardSection } from "@/components/patterns/page-patterns";
import { ChannelBadge, CampaignStatusBadge } from "@/components/marketing/badges";
import { PerformanceChartMock } from "@/components/marketing/performance-chart";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/format";
import { objectiveLabel } from "@/mocks/marketing/campaigns";
import { monthlySeries } from "@/mocks/marketing/performance";
import type { Campaign } from "@/types/marketing";

export function CampaignDetail({ campaign: c }: { campaign: Campaign }) {
  const { toast } = useToast();
  const [paused, setPaused] = React.useState(c.status === "pausada");

  const metrics = [
    { label: "Investido", value: formatCurrency(c.spent) },
    { label: "Leads", value: formatNumber(c.leads) },
    { label: "CPL", value: formatCurrency(c.cpl) },
    { label: "Conversões", value: formatNumber(c.conversions) },
    { label: "Receita", value: formatCurrency(c.revenue) },
    { label: "ROAS", value: `${c.roas}x` },
  ];

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <KPIBlock label="Receita" value={formatCurrency(c.revenue)} delta={`ROAS ${c.roas}x`} trend="up" />
        <div className="mt-4"><CampaignStatusBadge status={paused ? "pausada" : c.status} /></div>
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Detalhes</p>
        <StatList
          items={[
            { label: "Canal", value: <ChannelBadge channel={c.channel} /> },
            { label: "Objetivo", value: objectiveLabel[c.objective] },
            { label: "Orçamento", value: formatCurrency(c.budget) },
            { label: "Período", value: `${c.startDate} – ${c.endDate}` },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={c.name}
      subtitle={`${objectiveLabel[c.objective]} · ${c.startDate}`}
      back={{ href: "/campaigns", label: "Campanhas" }}
      actions={
        <>
          <Button size="sm" variant="secondary">
            <Pencil />
            Editar
          </Button>
          <Button
            size="sm"
            variant={paused ? "primary" : "secondary"}
            onClick={() => {
              setPaused((p) => !p);
              toast({ title: paused ? "Campanha ativada (mock)" : "Campanha pausada (mock)", variant: paused ? "success" : "warning" });
            }}
          >
            {paused ? <CirclePlay /> : <CirclePause />}
            {paused ? "Ativar" : "Pausar"}
          </Button>
        </>
      }
      aside={aside}
    >
      <Tabs defaultValue="resumo">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {metrics.map((m) => (
                <Card key={m.label} className="p-4"><KPIBlock label={m.label} value={m.value} /></Card>
              ))}
            </div>
            <Card className="p-5">
              <p className="mb-2 font-display text-h3 font-semibold text-ink">Investimento x Receita</p>
              <PerformanceChartMock data={monthlySeries} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metricas">
          <Card className="p-5">
            <StatList
              items={[
                { label: "Orçamento", value: formatCurrency(c.budget) },
                { label: "Investido", value: formatCurrency(c.spent) },
                { label: "Leads", value: formatNumber(c.leads) },
                { label: "CPL", value: formatCurrency(c.cpl) },
                { label: "Conversões", value: formatNumber(c.conversions) },
                { label: "Receita", value: formatCurrency(c.revenue) },
                { label: "ROAS", value: `${c.roas}x` },
              ]}
            />
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <DashboardSection title="Histórico">
            <Card className="p-5">
              <Timeline
                items={[
                  { id: "h1", icon: Megaphone, title: "Campanha criada", time: c.startDate },
                  { id: "h2", icon: Target, title: "Orçamento ajustado", description: `Novo orçamento: ${formatCurrency(c.budget)}`, time: "há 5 dias" },
                  { id: "h3", icon: TrendingUp, title: "ROAS atingiu meta", description: `ROAS ${c.roas}x`, time: "há 2 dias" },
                ]}
              />
            </Card>
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </DetailPageLayout>
  );
}
