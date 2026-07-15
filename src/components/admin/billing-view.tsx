"use client";

import { CreditCard, Download, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PreviewNotice } from "@/components/admin/preview-notice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/format";
import {
  invoices,
  paymentMethod,
  nextCharge,
  invoiceStatusLabel,
  invoiceStatusTone,
} from "@/mocks/admin/billing";
import type { Invoice } from "@/types/admin";

export function BillingView() {

  const columns: DataTableColumn<Invoice>[] = [
    { id: "number", header: "Fatura", cell: (i) => <span className="font-mono text-caption text-ink-2">{i.number}</span> },
    { id: "date", header: "Data", cell: (i) => i.date },
    { id: "plan", header: "Plano", cell: (i) => <Badge tone="neutral" className="normal-case">{i.plan}</Badge> },
    { id: "amount", header: "Valor", className: "text-right", cell: (i) => <span className="tabular-nums font-medium">{formatCurrency(i.amount)}</span> },
    { id: "status", header: "Status", cell: (i) => <Badge tone={invoiceStatusTone[i.status]}>{invoiceStatusLabel[i.status]}</Badge> },
    { id: "download", header: "", hideable: false, className: "text-right", cell: (i) => (
      <Button size="sm" variant="ghost" disabled aria-label={`Baixar nota ${i.number}`}>
        <Download className="size-4" aria-hidden />
      </Button>
    ) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PreviewNotice>
        Faturamento não existe no backend: não há assinatura, fatura nem meio de pagamento
        modelados. Os valores abaixo são ilustrativos.
      </PreviewNotice>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-start gap-4 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <CalendarClock className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-caption font-medium uppercase tracking-wide text-ink-2">Próxima cobrança</p>
            <p className="mt-1 font-display text-h2 font-bold text-ink">{formatCurrency(nextCharge.amount)}</p>
            <p className="text-body2 text-ink-2">{nextCharge.plan} · {nextCharge.date}</p>
          </div>
        </Card>

        <Card className="flex items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-2">
              <CreditCard className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-caption font-medium uppercase tracking-wide text-ink-2">Forma de pagamento</p>
              <p className="mt-1 font-medium text-ink">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
              <p className="text-body2 text-ink-2">Expira {paymentMethod.expiry}</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" disabled>Alterar</Button>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-h3 font-semibold text-ink">Histórico de cobranças</h3>
          <Button size="sm" variant="secondary" disabled>
            <Download className="size-4" aria-hidden /> Exportar
          </Button>
        </div>
        <DataTable data={invoices} columns={columns} getRowId={(i) => i.id} pageSize={6} empty={{ icon: Download, title: "Nenhuma fatura." }} />
      </Card>
    </div>
  );
}
