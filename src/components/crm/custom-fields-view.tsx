"use client";

import * as React from "react";
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Combobox } from "@/components/ui/combobox";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCustomFieldDefsFor, useDeleteCustomFieldDef } from "@/hooks/crm/use-custom-fields";
import { CustomFieldFormModal } from "@/components/crm/custom-field-form-modal";
import {
  CUSTOM_FIELD_TYPES,
  entityLabel,
  messageForCustomFieldError,
  optionsOf,
  typeLabel,
} from "@/lib/crm/custom-fields";
import type { ApiCustomFieldDef, CustomFieldEntity } from "@/types/api/crm";

const ALL = "__all__";

/**
 * Gestão das definições de campos personalizados.
 *
 * O contrato de `GET /custom-fields` aceita SOMENTE `entityType` e devolve um
 * array puro (sem paginação e sem busca). Por isso o filtro de entidade é do
 * SERVIDOR e a busca/tipo/obrigatório são aplicados no cliente sobre a lista
 * completa — não há endpoint para delegá-los.
 */
export function CustomFieldsView() {
  const { toast } = useToast();
  const { can } = useSession();

  const [entity, setEntity] = React.useState<string>(ALL);
  const [type, setType] = React.useState<string>(ALL);
  const [onlyRequired, setOnlyRequired] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<ApiCustomFieldDef | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const defs = useCustomFieldDefsFor(entity === ALL ? undefined : (entity as CustomFieldEntity));
  const del = useDeleteCustomFieldDef();

  if (!can("crm.custom_fields.read")) {
    return (
      <p className="py-10 text-center text-body2 text-ink-3">
        Você não tem permissão para ver os campos personalizados.
      </p>
    );
  }
  if (defs.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os campos personalizados."
        onRetry={() => defs.refetch()}
      />
    );
  }

  const canUpdate = can("crm.custom_fields.update");
  const canDelete = can("crm.custom_fields.delete");

  const q = query.trim().toLowerCase();
  const items = (defs.data ?? []).filter((d) => {
    if (type !== ALL && d.type !== type) return false;
    if (onlyRequired && !d.required) return false;
    if (!q) return true;
    return d.name.toLowerCase().includes(q) || d.key.toLowerCase().includes(q);
  });

  const columns: DataTableColumn<ApiCustomFieldDef>[] = [
    {
      id: "name",
      header: "Campo",
      cell: (d) => (
        <div className="flex flex-col">
          <span className="font-medium text-ink">{d.name}</span>
          <code className="font-mono text-caption text-ink-3">{d.key}</code>
        </div>
      ),
    },
    {
      id: "entity",
      header: "Entidade",
      cell: (d) => (
        <Badge tone="neutral" className="normal-case">
          {entityLabel(d.entityType)}
        </Badge>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: (d) => (
        <span className="text-ink-2">
          {typeLabel(d.type)}
          {optionsOf(d).length > 0 ? (
            <span className="ml-1 text-caption text-ink-3">({optionsOf(d).length} opções)</span>
          ) : null}
        </span>
      ),
    },
    {
      id: "required",
      header: "Obrigatório",
      cell: (d) => (d.required ? <Badge tone="warning">Obrigatório</Badge> : <span className="text-ink-3">—</span>),
    },
    {
      id: "status",
      header: "Status",
      hideable: true,
      cell: (d) =>
        d.active ? <Badge tone="success">Ativo</Badge> : <Badge tone="neutral">Inativo</Badge>,
    },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: (d) =>
        canUpdate || canDelete ? (
          <div className="flex items-center justify-end gap-1">
            {canUpdate ? (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Editar ${d.name}`}
                onClick={() => setEditing(d)}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Excluir ${d.name}`}
                onClick={() => setConfirmId(d.id)}
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
          placeholder="Buscar por nome ou key…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-44">
          <Combobox
            options={[
              { value: ALL, label: "Todas as entidades" },
              { value: "CONTACT", label: "Contato" },
              { value: "ORGANIZATION", label: "Organização" },
            ]}
            value={entity}
            onValueChange={setEntity}
          />
        </div>
        <div className="w-44">
          <Combobox
            options={[
              { value: ALL, label: "Todos os tipos" },
              ...CUSTOM_FIELD_TYPES.map((t) => ({ value: t, label: typeLabel(t) })),
            ]}
            value={type}
            onValueChange={setType}
          />
        </div>
        <Button
          size="sm"
          variant={onlyRequired ? "primary" : "secondary"}
          aria-pressed={onlyRequired}
          onClick={() => setOnlyRequired((v) => !v)}
        >
          Somente obrigatórios
        </Button>
      </FilterBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(d) => d.id}
        loading={defs.isLoading}
        pageSize={20}
        empty={{
          icon: SlidersHorizontal,
          title: "Nenhum campo personalizado.",
          description: "Crie campos para capturar dados próprios do seu negócio.",
        }}
      />

      <CustomFieldFormModal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        def={editing ?? undefined}
      />

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Excluir campo personalizado?"
        description="O campo deixa de ser exibido e os valores já preenchidos são preservados. A key continua reservada e não pode ser reutilizada."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          const id = confirmId;
          setConfirmId(null);
          if (!id) return;
          del.mutate(id, {
            onSuccess: () => toast({ title: "Campo excluído", variant: "success" }),
            onError: (e) => toast({ title: messageForCustomFieldError(e), variant: "error" }),
          });
        }}
      />
    </div>
  );
}
