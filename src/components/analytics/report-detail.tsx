"use client";

import Link from "next/link";
import { CalendarClock, Copy, Download, Pencil, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPIBlock, StatList } from "@/components/business/kpi-block";
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
import { ReportStatusBadge } from "@/components/analytics/badges";
import { AnalyticsChartMock } from "@/components/analytics/analytics-chart";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/format";
import { revenueSeries, byChannel } from "@/mocks/analytics/analytics";
import type { Report } from "@/types/analytics";

export function ReportDetail({ report: r }: { report: Report }) {
  const { toast } = useToast();

  const aside = (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <KPIBlock label="Views" value={formatNumber(r.views)} delta="+6%" trend="up" />
        <div className="mt-4"><ReportStatusBadge status={r.status} size="md" /></div>
      </Card>
      <Card className="p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">Detalhes</p>
        <StatList
          items={[
            { label: "Categoria", value: <Badge tone="neutral" className="normal-case">{r.category}</Badge> },
            { label: "Responsável", value: r.owner },
            { label: "Compartilhado", value: r.shared ? "Sim" : "Não" },
            { label: "Agendado", value: r.scheduled ? "Sim" : "Não" },
            { label: "Atualizado", value: r.updatedAt },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={r.name}
      subtitle={r.description}
      back={{ href: "/reports", label: "Relatórios" }}
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "Link copiado (mock)" })}><Share2 />Compartilhar</Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "Exportação iniciada (mock)", variant: "success" })}><Download />Exportar</Button>
          <Button size="sm" asChild><Link href="/reports/new"><Pencil />Editar</Link></Button>
        </>
      }
      aside={aside}
    >
      <div className="flex flex-col gap-5">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-h3 font-semibold text-ink">Receita — últimos 8 meses</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="Duplicar" onClick={() => toast({ title: "Duplicado (mock)", variant: "success" })}><Copy /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Agendar" onClick={() => toast({ title: "Envio agendado (mock)", variant: "success" })}><CalendarClock /></Button>
            </div>
          </div>
          <AnalyticsChartMock data={revenueSeries} type="area" ariaLabel="Receita por mês" />
        </Card>

        <Card className="overflow-hidden p-0">
          <p className="border-b border-line px-4 py-3 font-display text-h3 font-semibold text-ink">Detalhamento por canal</p>
          <TableContainer className="border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Período anterior</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byChannel.map((c) => {
                  const diff = Math.round(((c.current - c.previous) / c.previous) * 100);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.label}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.valueLabel}</TableCell>
                      <TableCell className="text-right tabular-nums text-ink-3">{formatCurrency(c.previous)}</TableCell>
                      <TableCell className={`text-right tabular-nums font-medium ${diff >= 0 ? "text-success" : "text-danger"}`}>{diff >= 0 ? "+" : ""}{diff}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </div>
    </DetailPageLayout>
  );
}
