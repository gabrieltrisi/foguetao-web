"use client";

import * as React from "react";
import { Pencil, Tags as TagsIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useTagsList, useDeleteTag } from "@/hooks/crm/use-tags";
import { TagFormModal } from "@/components/crm/tag-form-modal";
import { messageForTagError } from "@/lib/crm/tag-errors";
import { formatDate } from "@/lib/crm/display";
import type { ApiTag } from "@/types/api/crm";

const PAGE_SIZE = 20;

/** Gestão de etiquetas — busca, paginação e ordenação são do servidor. */
export function TagsView() {
  const { toast } = useToast();
  const { can } = useSession();

  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<ApiTag | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError, isFetching, refetch } = useTagsList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });
  const del = useDeleteTag();

  if (!can("crm.tags.read")) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver as etiquetas.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as etiquetas." onRetry={() => refetch()} />;
  }

  const canUpdate = can("crm.tags.update");
  const canDelete = can("crm.tags.delete");
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const columns: DataTableColumn<ApiTag>[] = [
    {
      id: "name",
      header: "Etiqueta",
      cell: (t) => (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className={cn("size-2.5 shrink-0 rounded-full", !t.color && "bg-line")}
            style={t.color ? { backgroundColor: t.color } : undefined}
          />
          <span className="font-medium text-ink">{t.name}</span>
        </span>
      ),
    },
    {
      id: "description",
      header: "Descrição",
      hideable: true,
      cell: (t) => <span className="text-ink-2">{t.description ?? "—"}</span>,
    },
    {
      id: "created",
      header: "Criada em",
      hideable: true,
      cell: (t) => <span className="text-ink-2">{t.createdAt ? formatDate(t.createdAt) : "—"}</span>,
    },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: (t) =>
        canUpdate || canDelete ? (
          <div className="flex items-center justify-end gap-1">
            {canUpdate ? (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Editar ${t.name}`}
                onClick={() => setEditing(t)}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Excluir ${t.name}`}
                onClick={() => setConfirmId(t.id)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : (
          <span className="text-caption text-ink-3">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar etiqueta…"
          containerClassName="w-full max-w-xs"
        />
      </FilterBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(t) => t.id}
        loading={isLoading}
        pageSize={PAGE_SIZE}
        empty={{
          icon: TagsIcon,
          title: "Nenhuma etiqueta.",
          description: "Crie etiquetas para classificar seus contatos.",
        }}
      />

      {totalPages > 1 ? (
        <div className={cn("flex justify-end", isFetching && "opacity-60")}>
          <Pagination page={data?.page ?? 1} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      <TagFormModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        tag={editing ?? undefined}
      />

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Excluir etiqueta?"
        description="A etiqueta será removida de todos os contatos associados."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          const id = confirmId;
          setConfirmId(null);
          if (!id) return;
          del.mutate(id, {
            onSuccess: () => toast({ title: "Etiqueta excluída", variant: "success" }),
            onError: (e) => toast({ title: messageForTagError(e), variant: "error" }),
          });
        }}
      />
    </div>
  );
}
