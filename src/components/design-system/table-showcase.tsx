"use client";

import * as React from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Pagination, CursorPagination } from "@/components/ui/pagination";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import type { Priority } from "@/types";
import { ShowcaseSection } from "@/components/design-system/showcase-ui";
import { ShowcaseNav } from "@/components/design-system/showcase-nav";
import { PageHeader } from "@/components/ui/page-header";

type Row = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: { label: string; tone: "success" | "warning" | "info" | "neutral" };
  priority: Priority;
  value: number;
};

const NAMES = [
  "Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado", "Núcleo Digital",
  "Vertex Farma", "Studio Ampère", "Grão Café", "Zenit Corp", "Aurora Labs", "Peça Rara", "Vinha & Co",
];
const COMPANIES = ["Grão Café", "Vertex Farma", "Zenit Corp", "Studio Ampère", "Núcleo Digital", "Aurora Labs"];
const STATUSES: Row["status"][] = [
  { label: "Ativo", tone: "success" },
  { label: "Em negociação", tone: "info" },
  { label: "Pendente", tone: "warning" },
  { label: "Inativo", tone: "neutral" },
];
const PRIORITIES: Priority[] = ["alta", "media", "baixa"];

const ALL_ROWS: Row[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `row-${i + 1}`,
  name: NAMES[i % NAMES.length],
  email: `${NAMES[i % NAMES.length].toLowerCase().replace(/[^a-z]/g, "")}@empresa.com.br`,
  company: COMPANIES[i % COMPANIES.length],
  status: STATUSES[i % STATUSES.length],
  priority: PRIORITIES[i % PRIORITIES.length],
  value: 4200 + (i % 9) * 1830,
}));

export function TableShowcase() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [empty, setEmpty] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [page, setPage] = React.useState(3);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "name",
      header: "Contato",
      sortable: true,
      sortAccessor: (r) => r.name,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <EntityAvatar name={r.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.name}</p>
            <p className="truncate text-caption text-ink-3">{r.email}</p>
          </div>
        </div>
      ),
    },
    { id: "company", header: "Organização", cell: (r) => r.company, hideable: true },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusBadge tone={r.status.tone}>{r.status.label}</StatusBadge>,
    },
    { id: "priority", header: "Prioridade", cell: (r) => <PriorityBadge priority={r.priority} /> },
    {
      id: "value",
      header: "Valor",
      sortable: true,
      sortAccessor: (r) => r.value,
      className: "text-right tabular-nums",
      cell: (r) => formatCurrency(r.value),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tabelas & dados" description="DataTable, paginação e estados." />
      <ShowcaseNav />

      <ShowcaseSection title="DataTable" description="Ordenação, seleção, busca, colunas e paginação.">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-body2 text-ink-2">
            <Switch checked={loading} onCheckedChange={setLoading} /> Loading
          </label>
          <label className="flex items-center gap-2 text-body2 text-ink-2">
            <Switch checked={empty} onCheckedChange={setEmpty} /> Vazio
          </label>
        </div>
        <DataTable
          data={empty ? [] : ALL_ROWS}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          selectable
          searchAccessor={(r) => `${r.name} ${r.email} ${r.company}`}
          searchPlaceholder="Buscar contato…"
          toolbarActions={
            <Button size="sm">
              <Plus />
              Novo contato
            </Button>
          }
          bulkActions={(ids) => (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
              aria-label={`Excluir ${ids.length}`}
            >
              <Trash2 />
              Excluir
            </Button>
          )}
          empty={{
            icon: Users,
            title: "Nenhum contato encontrado.",
            description: "Ajuste a busca ou adicione um novo contato.",
            action: (
              <Button size="sm">
                <Plus />
                Novo contato
              </Button>
            ),
          }}
        />
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Excluir contatos?"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          destructive
          onConfirm={() => toast({ title: "Contatos excluídos (mock)", variant: "success" })}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Paginação">
        <div className="flex flex-col gap-6">
          <Pagination page={page} totalPages={12} onPageChange={setPage} />
          <CursorPagination hasPrev hasNext label="1–10 de muitos" />
        </div>
      </ShowcaseSection>
    </div>
  );
}
