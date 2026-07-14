"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Combobox } from "@/components/ui/combobox";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { MetricSelector, DimensionSelector, ChartTypeSelector } from "@/components/analytics/selectors";
import { AnalyticsChartMock, type ChartType } from "@/components/analytics/analytics-chart";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/format";
import { revenueSeries, byChannel } from "@/mocks/analytics/analytics";

const SOURCES = ["Vendas", "CRM", "Marketing", "Financeiro", "Atendimento"].map((s) => ({ value: s.toLowerCase(), label: s }));
const GROUPINGS = [{ value: "dia", label: "Dia" }, { value: "semana", label: "Semana" }, { value: "mes", label: "Mês" }];
const ORDERINGS = [{ value: "receita-desc", label: "Receita (maior)" }, { value: "receita-asc", label: "Receita (menor)" }, { value: "nome", label: "Nome (A-Z)" }];
const PERIODS = [{ value: "7d", label: "7 dias" }, { value: "30d", label: "30 dias" }, { value: "mes", label: "Este mês" }, { value: "trimestre", label: "Trimestre" }];

const METRICS = [
  { id: "revenue", label: "Receita" }, { id: "leads", label: "Leads" }, { id: "sales", label: "Vendas" },
  { id: "conversion", label: "Conversão" }, { id: "cac", label: "CAC" }, { id: "roas", label: "ROAS" }, { id: "ticket", label: "Ticket médio" },
];
const DIMENSIONS = [
  { id: "canal", label: "Canal" }, { id: "campanha", label: "Campanha" }, { id: "responsavel", label: "Responsável" },
  { id: "periodo", label: "Período" }, { id: "produto", label: "Produto" },
];

export function ReportBuilder({ initialName = "Novo relatório" }: { initialName?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState(initialName);
  const [source, setSource] = React.useState("vendas");
  const [metrics, setMetrics] = React.useState<string[]>(["revenue", "leads"]);
  const [dimensions, setDimensions] = React.useState<string[]>(["canal"]);
  const [period, setPeriod] = React.useState("30d");
  const [grouping, setGrouping] = React.useState("mes");
  const [ordering, setOrdering] = React.useState("receita-desc");
  const [chart, setChart] = React.useState<ChartType>("area");
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Relatório salvo (mock)", variant: "success" });
    router.push("/reports");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/reports" className="inline-flex items-center gap-1 rounded-md text-body2 font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><ChevronLeft className="size-4" aria-hidden />Relatórios</Link>
        <input aria-label="Nome do relatório" value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 font-display text-h2 font-bold text-ink hover:border-line focus-visible:border-brand focus-visible:outline-none" />
        <Button variant="secondary" size="sm" onClick={() => toast({ title: "Exportação iniciada (mock)", variant: "success" })}><Download />Exportar</Button>
        <Button size="sm" loading={saving} onClick={save}><Save />Salvar</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Config */}
        <Card className="flex flex-col gap-5 p-5">
          <FormField id="rb-source" label="Fonte de dados">{(p) => <Combobox id={p.id} options={SOURCES} value={source} onValueChange={setSource} />}</FormField>
          <div>
            <p className="mb-1.5 text-body2 font-semibold text-ink">Métricas</p>
            <MetricSelector options={METRICS} selected={metrics} onChange={setMetrics} />
          </div>
          <div>
            <p className="mb-1.5 text-body2 font-semibold text-ink">Dimensões</p>
            <DimensionSelector options={DIMENSIONS} selected={dimensions} onChange={setDimensions} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="rb-period" label="Período">{(p) => <Combobox id={p.id} options={PERIODS} value={period} onValueChange={setPeriod} />}</FormField>
            <FormField id="rb-group" label="Agrupamento">{(p) => <Combobox id={p.id} options={GROUPINGS} value={grouping} onValueChange={setGrouping} />}</FormField>
          </div>
          <FormField id="rb-order" label="Ordenação">{(p) => <Combobox id={p.id} options={ORDERINGS} value={ordering} onValueChange={setOrdering} />}</FormField>
          <div>
            <p className="mb-1.5 text-body2 font-semibold text-ink">Visualização</p>
            <ChartTypeSelector value={chart} onChange={setChart} />
          </div>
        </Card>

        {/* Preview */}
        <Card className="flex flex-col gap-5 p-5">
          <div>
            <p className="mb-2 font-display text-h3 font-semibold text-ink">Preview</p>
            <AnalyticsChartMock data={revenueSeries} type={chart} ariaLabel="Preview do relatório" />
          </div>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byChannel.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.valueLabel}</TableCell>
                    <TableCell className="text-right tabular-nums text-ink-3">{formatCurrency(c.previous)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <p className="text-caption text-ink-3">{metrics.length} métrica(s) · {dimensions.length} dimensão(ões) · {formatNumber(byChannel.length)} linhas</p>
        </Card>
      </div>
    </div>
  );
}
