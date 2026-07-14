"use client";

import * as React from "react";
import Link from "next/link";
import { SquareKanban, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { usePipelines, useSetDefaultPipeline, useDeletePipeline } from "@/hooks/crm/use-pipelines";
import { messageForPipelineError } from "@/components/crm/pipeline-form";
import { formatDate } from "@/lib/crm/display";
import type { ApiPipeline } from "@/types/api/crm-deals";

export function PipelinesView() {
  const { toast } = useToast();
  const { can } = useSession();
  const { data, isLoading, isError, refetch } = usePipelines({ limit: 50, sortBy: "createdAt", sortOrder: "asc" });
  const setDefault = useSetDefaultPipeline();
  const del = useDeletePipeline();
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const canUpdate = can("crm.pipelines.update");
  const canDelete = can("crm.pipelines.delete");

  if (!can("crm.pipelines.read")) {
    return <p className="py-10 text-center text-body2 text-ink-3">Você não tem permissão para ver pipelines.</p>;
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar os pipelines." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];

  const columns: DataTableColumn<ApiPipeline>[] = [
    {
      id: "name",
      header: "Pipeline",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Link href={`/pipelines/${p.id}`} className="font-medium text-ink hover:text-brand">
            {p.name}
          </Link>
          {p.isDefault ? <Badge tone="brand">Padrão</Badge> : null}
          {!p.active ? <Badge tone="neutral">Inativo</Badge> : null}
        </div>
      ),
    },
    { id: "description", header: "Descrição", hideable: true, cell: (p) => <span className="text-ink-2">{p.description ?? "—"}</span> },
    { id: "created", header: "Criado em", hideable: true, cell: (p) => <span className="text-ink-2">{formatDate(p.createdAt)}</span> },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          {canUpdate && !p.isDefault ? (
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Definir ${p.name} como padrão`}
              loading={setDefault.isPending && setDefault.variables === p.id}
              onClick={() =>
                setDefault.mutate(p.id, {
                  onSuccess: () => toast({ title: "Pipeline padrão atualizado", variant: "success" }),
                  onError: (e) => toast({ title: messageForPipelineError(e), variant: "error" }),
                })
              }
            >
              <Star className="size-4" aria-hidden /> Tornar padrão
            </Button>
          ) : null}
          {canDelete ? (
            <Button size="sm" variant="ghost" aria-label={`Excluir ${p.name}`} onClick={() => setConfirmId(p.id)}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        data={items}
        columns={columns}
        getRowId={(p) => p.id}
        loading={isLoading}
        pageSize={50}
        empty={{ icon: SquareKanban, title: "Nenhum pipeline.", description: "Crie um pipeline para organizar suas oportunidades." }}
      />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Excluir pipeline?"
        description="Só é possível excluir pipelines sem oportunidades ativas."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          const id = confirmId!;
          del.mutate(id, {
            onSuccess: () => toast({ title: "Pipeline excluído", variant: "success" }),
            onError: (e) => toast({ title: messageForPipelineError(e), variant: "error" }),
          });
          setConfirmId(null);
        }}
      />
    </div>
  );
}
