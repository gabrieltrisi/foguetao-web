"use client";

import * as React from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { NumberInput } from "@/components/ui/number-input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/business/badges";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";
import { marketingForms, formStatusLabel, formStatusTone } from "@/mocks/marketing/forms";
import type { MarketingForm } from "@/types/marketing";
import { PreviewBanner } from "@/components/ui/preview-banner";

export function FormsView() {
  const { toast } = useToast();
  const [fields, setFields] = React.useState(4);

  const columns: DataTableColumn<MarketingForm>[] = [
    { id: "name", header: "Formulário", sortable: true, sortAccessor: (f) => f.name, cell: (f) => <span className="inline-flex items-center gap-2 font-medium text-ink"><FileText className="size-4 text-ink-3" aria-hidden />{f.name}</span> },
    { id: "status", header: "Status", cell: (f) => <StatusBadge tone={formStatusTone[f.status]}>{formStatusLabel[f.status]}</StatusBadge> },
    { id: "views", header: "Views", className: "text-right tabular-nums", cell: (f) => formatNumber(f.views) },
    { id: "leads", header: "Leads", sortable: true, sortAccessor: (f) => f.leads, className: "text-right tabular-nums", cell: (f) => formatNumber(f.leads) },
    { id: "conv", header: "Conversão", sortable: true, sortAccessor: (f) => f.conversion, className: "text-right tabular-nums", cell: (f) => `${f.conversion}%` },
    { id: "fields", header: "Campos", className: "text-right tabular-nums", cell: (f) => formatNumber(f.fields) },
    { id: "updated", header: "Atualizado", cell: (f) => <span className="text-ink-2">{f.updatedAt}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PreviewBanner feature="Formulários" />
      <div className="flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus />
              Criar formulário
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            title="Novo formulário"
            description="Configure um formulário de captação."
            footer={
              <>
                <SheetClose asChild><Button size="sm" variant="secondary">Cancelar</Button></SheetClose>
                <SheetClose asChild><Button size="sm" onClick={() => toast({ title: "Formulário criado (mock)", variant: "success" })}>Salvar</Button></SheetClose>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <FormField id="frm-name" label="Nome" required>
                {(p) => <Input placeholder="Ex.: Contato — Site" {...p} />}
              </FormField>
              <FormField id="frm-fields" label="Quantidade de campos">
                {() => <NumberInput value={fields} onValueChange={setFields} min={1} max={20} />}
              </FormField>
              <FormField id="frm-redirect" label="URL de redirecionamento">
                {(p) => <Input placeholder="https://foguetao.com.br/obrigado" {...p} />}
              </FormField>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <DataTable
        data={marketingForms}
        columns={columns}
        getRowId={(f) => f.id}
        searchAccessor={(f) => f.name}
        searchPlaceholder="Buscar formulários…"
        empty={{ icon: FileText, title: "Nenhum formulário.", action: <Button size="sm"><Plus />Criar formulário</Button> }}
      />
    </div>
  );
}
