"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { AttributionCard } from "@/components/marketing/comparison";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AttributionModelSelector } from "@/components/analytics/attribution-model-selector";
import { attributionByModel } from "@/mocks/analytics/attribution";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AttributionModel } from "@/types/analytics";

export function AttributionView() {
  const [model, setModel] = React.useState<AttributionModel>("last");
  const rows = attributionByModel[model];
  const totalConv = rows.reduce((s, r) => s + r.conversions, 0);
  const totalRev = rows.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5"><AttributionModelSelector value={model} onChange={setModel} /></Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5"><KPIBlock label="Conversões atribuídas" value={formatNumber(totalConv)} /></Card>
        <Card className="p-5"><KPIBlock label="Receita atribuída" value={formatCurrency(totalRev)} delta="+12%" trend="up" /></Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <AttributionCard title="Receita atribuída por canal" segments={rows.map((r) => ({ id: r.id, label: r.label, value: r.revenue, valueLabel: formatCurrency(r.revenue) }))} />
        </Card>
        <Card className="overflow-hidden p-0">
          <p className="border-b border-line px-4 py-3 font-display text-h3 font-semibold text-ink">Detalhamento</p>
          <TableContainer className="border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal / Fonte</TableHead>
                  <TableHead className="text-right">Conversões</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(r.conversions)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </div>
    </div>
  );
}
