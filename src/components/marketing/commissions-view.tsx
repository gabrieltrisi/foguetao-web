"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPIBlock } from "@/components/business/kpi-block";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { CommissionStatusBadge } from "@/components/marketing/badges";
import { formatCurrency } from "@/lib/format";
import { commissions, commissionStatusLabel } from "@/mocks/marketing/affiliates";
import type { Commission, CommissionStatus } from "@/types/marketing";

const STATUS_OPTIONS = [
  { value: "todas", label: "Todos os status" },
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovada" },
  { value: "paid", label: "Paga" },
  { value: "rejected", label: "Recusada" },
];

export function CommissionsView() {
  const [status, setStatus] = React.useState("todas");
  const filtered = commissions.filter((c) => status === "todas" || c.status === status);

  const totalPaid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const totalPending = commissions.filter((c) => c.status === "pending" || c.status === "approved").reduce((s, c) => s + c.amount, 0);

  const columns: DataTableColumn<Commission>[] = [
    { id: "affiliate", header: "Afiliado", cell: (c) => <span className="inline-flex items-center gap-2 font-medium text-ink"><EntityAvatar name={c.affiliate} size="sm" />{c.affiliate}</span> },
    { id: "date", header: "Data", cell: (c) => <span className="text-ink-2">{c.date}</span> },
    { id: "sale", header: "Venda", sortable: true, sortAccessor: (c) => c.saleValue, className: "text-right tabular-nums", cell: (c) => formatCurrency(c.saleValue) },
    { id: "amount", header: "Comissão", sortable: true, sortAccessor: (c) => c.amount, className: "text-right tabular-nums font-semibold", cell: (c) => formatCurrency(c.amount) },
    { id: "status", header: "Status", cell: (c) => <CommissionStatusBadge status={c.status} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><DollarSign className="size-5" aria-hidden /></span><KPIBlock label="Pago" value={formatCurrency(totalPaid)} /></Card>
        <Card className="p-5"><KPIBlock label="A pagar" value={formatCurrency(totalPending)} /></Card>
        <Card className="p-5"><KPIBlock label="Comissões" value={String(commissions.length)} /></Card>
        <Card className="p-5"><KPIBlock label="Taxa média" value="15%" /></Card>
      </div>

      <FilterBar>
        <div className="w-48"><Combobox options={STATUS_OPTIONS} value={status} onValueChange={setStatus} /></div>
      </FilterBar>

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(c) => c.id}
        pageSize={8}
        empty={{ icon: DollarSign, title: `Nenhuma comissão ${status !== "todas" ? commissionStatusLabel[status as CommissionStatus].toLowerCase() : ""}.` }}
      />
    </div>
  );
}
