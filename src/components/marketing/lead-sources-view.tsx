"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { Modal, ModalContent } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  useCreateLeadSource,
  useDeleteLeadSource,
  useLeadSources,
  useSetupLeadSources,
  useUpdateLeadSource,
} from "@/hooks/marketing/use-lead-sources";
import {
  LEAD_SOURCE_KINDS,
  kindLabel,
  messageForAttributionError,
} from "@/lib/marketing/attribution";
import type { ApiLeadSource } from "@/types/api/marketing";

/**
 * Origens de lead — catálogo REAL da empresa (`GET /lead-sources`).
 *
 * As colunas de Leads, Conversão, CPL, Receita e Tendência foram REMOVIDAS:
 * o contrato de origens não tem nenhuma delas. Contagem de leads por origem
 * depende de atribuição e vive no contato/campanha; CPL e receita não existem
 * em domínio nenhum ainda. Exibi-las exigiria mock.
 */
const ALL = "__all__";

export function LeadSourcesView() {
  const { can } = useSession();
  const { toast } = useToast();
  const [kind, setKind] = React.useState(ALL);
  const [editing, setEditing] = React.useState<ApiLeadSource | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [removing, setRemoving] = React.useState<ApiLeadSource | null>(null);

  const canManage = can(PERMISSIONS.MARKETING_LEAD_SOURCES_MANAGE);
  const { data, isLoading, isError, refetch } = useLeadSources(kind === ALL ? undefined : { kind });
  const setup = useSetupLeadSources();
  const remove = useDeleteLeadSource();

  if (!can(PERMISSIONS.MARKETING_LEAD_SOURCES_READ)) {
    return (
      <p className="text-body2 text-ink-3 py-10 text-center">
        Você não tem permissão para ver as origens de lead.
      </p>
    );
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as origens." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];

  async function runSetup() {
    try {
      await setup.mutateAsync();
      toast({ title: "Origens padrão criadas", variant: "success" });
    } catch (error) {
      toast({ title: messageForAttributionError(error), variant: "error" });
    }
  }

  async function handleDelete() {
    if (!removing) return;
    try {
      await remove.mutateAsync(removing.id);
      toast({ title: "Origem excluída", variant: "success" });
      setRemoving(null);
    } catch (error) {
      // 409 esperado: origem padrão ou em uso. O motivo real vem do backend.
      toast({ title: messageForAttributionError(error), variant: "error" });
    }
  }

  const columns: DataTableColumn<ApiLeadSource>[] = [
    {
      id: "name",
      header: "Origem",
      sortable: true,
      sortAccessor: (s) => s.name,
      cell: (s) => (
        <div className="flex flex-col">
          <span className="text-ink font-medium">{s.name}</span>
          {s.description ? (
            <span className="text-caption text-ink-3 truncate">{s.description}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "kind",
      header: "Agrupamento",
      cell: (s) => (
        <Badge tone="neutral" className="normal-case">
          {kindLabel(s.kind)}
        </Badge>
      ),
    },
    {
      id: "active",
      header: "Status",
      cell: (s) =>
        s.active ? <Badge tone="success">Ativa</Badge> : <Badge tone="neutral">Inativa</Badge>,
    },
    {
      id: "system",
      header: "Tipo",
      hideable: true,
      cell: (s) => (
        <span className="text-ink-2 text-body2">{s.system ? "Padrão" : "Personalizada"}</span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            className: "w-24 text-right",
            cell: (s: ApiLeadSource) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Editar ${s.name}`}
                  onClick={() => setEditing(s)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Excluir ${s.name}`}
                  onClick={() => setRemoving(s)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <FilterBar>
        <div className="w-56">
          <Combobox
            options={[
              { value: ALL, label: "Todos os agrupamentos" },
              ...LEAD_SOURCE_KINDS.map((k) => ({ value: k, label: kindLabel(k) })),
            ]}
            value={kind}
            onValueChange={setKind}
          />
        </div>
        {canManage ? (
          <Button size="sm" className="ml-auto" onClick={() => setCreating(true)}>
            <Plus />
            Nova origem
          </Button>
        ) : null}
      </FilterBar>

      <DataTable
        data={items}
        columns={columns}
        getRowId={(s) => s.id}
        loading={isLoading}
        pageSize={50}
        empty={{
          icon: Workflow,
          title: "Nenhuma origem cadastrada.",
          description: canManage
            ? "Comece pelas origens padrão ou crie a sua."
            : "Peça a um gestor para cadastrar as origens.",
          action: canManage ? (
            <Button size="sm" loading={setup.isPending} onClick={runSetup}>
              Criar origens padrão
            </Button>
          ) : undefined,
        }}
      />

      {creating ? <LeadSourceModal onClose={() => setCreating(false)} /> : null}
      {editing ? <LeadSourceModal source={editing} onClose={() => setEditing(null)} /> : null}

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Excluir origem?"
        description={`“${removing?.name}” sai do catálogo. Origens padrão ou já usadas em atribuições não podem ser excluídas — nesse caso, desative-a.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

/** Criar/editar origem. `kind` é só agrupamento — o nome é livre. */
function LeadSourceModal({ source, onClose }: { source?: ApiLeadSource; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = Boolean(source);
  const create = useCreateLeadSource();
  const update = useUpdateLeadSource(source?.id ?? "");

  const [name, setName] = React.useState(source?.name ?? "");
  const [kind, setKind] = React.useState<string>(source?.kind ?? "OTHER");
  const [description, setDescription] = React.useState(source?.description ?? "");
  const [active, setActive] = React.useState(source?.active ?? true);

  const pending = create.isPending || update.isPending;
  const invalid = name.trim().length < 1;

  async function handleSave() {
    const body = {
      name: name.trim(),
      kind,
      description: description.trim() || (isEdit ? null : undefined),
      active,
    };
    try {
      if (isEdit) {
        await update.mutateAsync(body);
        toast({ title: "Origem atualizada", variant: "success" });
      } else {
        await create.mutateAsync(body);
        toast({ title: "Origem criada", variant: "success" });
      }
      onClose();
    } catch (error) {
      toast({ title: messageForAttributionError(error), variant: "error" });
    }
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        title={isEdit ? "Editar origem" : "Nova origem"}
        description="O nome é da sua operação; o agrupamento serve para comparar origens."
      >
        <div className="flex flex-col gap-4">
          <FormField id="ls-name" label="Nome" required>
            {(p) => (
              <Input
                placeholder="Ex.: Indicação de aluno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...p}
              />
            )}
          </FormField>
          <FormField id="ls-kind" label="Agrupamento">
            {(p) => (
              <Combobox
                id={p.id}
                options={LEAD_SOURCE_KINDS.map((k) => ({ value: k, label: kindLabel(k) }))}
                value={kind}
                onValueChange={setKind}
              />
            )}
          </FormField>
          <FormField id="ls-desc" label="Descrição">
            {(p) => (
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                {...p}
              />
            )}
          </FormField>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body2 text-ink font-medium">Ativa</p>
              <p className="text-caption text-ink-3">
                Origens inativas não podem receber novas atribuições.
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} aria-label="Origem ativa" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" loading={pending} disabled={invalid} onClick={handleSave}>
              {isEdit ? "Salvar" : "Criar origem"}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
