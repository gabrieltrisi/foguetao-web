"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { Modal, ModalContent } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useMessageTemplates,
  useUpdateMessageTemplate,
} from "@/hooks/messaging-templates/use-message-templates";
import type { ApiMessageTemplate } from "@/types/api/messaging-templates";

const BODY_LIMIT = 8192;

export function TemplatesView() {
  const { toast } = useToast();
  const { can } = useSession();
  const canCreate = can(PERMISSIONS.MESSAGING_TEMPLATES_CREATE);
  const canUpdate = can(PERMISSIONS.MESSAGING_TEMPLATES_UPDATE);
  const canDelete = can(PERMISSIONS.MESSAGING_TEMPLATES_DELETE);

  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  // Debounce da busca (padrão do projeto: 350ms).
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);
  const list = useMessageTemplates(search ? { search } : undefined);
  const items = list.data?.items ?? [];

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ApiMessageTemplate | null>(null);
  const [toDelete, setToDelete] = React.useState<ApiMessageTemplate | null>(null);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (t: ApiMessageTemplate) => {
    setEditing(t);
    setEditorOpen(true);
  };

  const remove = useDeleteMessageTemplate();
  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => toast({ title: "Template excluído", variant: "success" }),
      onError: () => toast({ title: "Não foi possível excluir", variant: "error" }),
      onSettled: () => setToDelete(null),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar templates…"
          containerClassName="w-full max-w-xs"
        />
        {canCreate ? (
          <Button size="sm" className="ml-auto" onClick={openNew}>
            <Plus className="size-4" aria-hidden /> Novo template
          </Button>
        ) : null}
      </FilterBar>

      {list.isLoading ? (
        <div className="flex items-center gap-2 py-10 text-body2 text-ink-2">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando…
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-body2 text-ink-3">
          {search ? "Nenhum template encontrado." : "Nenhum template ainda. Crie o primeiro."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3 p-4">
              <p className="truncate font-display text-h3 font-semibold text-ink">{t.name}</p>
              <p className="line-clamp-4 min-h-[5rem] whitespace-pre-wrap text-body2 text-ink-2">
                {t.body}
              </p>
              <div className="flex items-center gap-2 border-t border-line pt-3">
                {canUpdate ? (
                  <Button variant="secondary" size="sm" onClick={() => openEdit(t)}>
                    <Pencil className="size-3.5" aria-hidden /> Editar
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-danger hover:text-danger"
                    onClick={() => setToDelete(t)}
                  >
                    <Trash2 className="size-3.5" aria-hidden /> Excluir
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editing}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Excluir template?"
        description={`"${toDelete?.name ?? ""}" será removido. Campanhas já criadas não são afetadas.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function TemplateEditor({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ApiMessageTemplate | null;
}) {
  const { toast } = useToast();
  const create = useCreateMessageTemplate();
  const update = useUpdateMessageTemplate();
  const [name, setName] = React.useState("");
  const [body, setBody] = React.useState("");

  // Sincroniza os campos ao abrir (novo = vazio; editar = valores do template).
  React.useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setBody(template?.body ?? "");
    }
  }, [open, template]);

  const saving = create.isPending || update.isPending;
  const valid = name.trim().length > 0 && body.trim().length > 0 && body.length <= BODY_LIMIT;

  const handleSave = () => {
    if (!valid) return;
    const payload = { name: name.trim(), body };
    const onError = (err: unknown) =>
      toast({
        title:
          err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 409
            ? "Já existe um template com esse nome"
            : "Não foi possível salvar",
        variant: "error",
      });
    if (template) {
      update.mutate(
        { id: template.id, body: payload },
        {
          onSuccess: () => {
            toast({ title: "Template atualizado", variant: "success" });
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Template criado", variant: "success" });
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title={template ? "Editar template" : "Novo template"}
        description="Reutilize a mensagem em várias campanhas. Use {{primeiro_nome}} para personalizar."
        footer={
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!valid}>
            Salvar
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <FormField id="tpl-name" label="Nome">
            {(field) => (
              <Input
                {...field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={160}
                placeholder="Ex.: Boas-vindas"
              />
            )}
          </FormField>
          <FormField id="tpl-body" label="Mensagem">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => setBody((b) => `${b}{{primeiro_nome}}`)}
                >
                  + {"{{primeiro_nome}}"}
                </Button>
                <Textarea
                  {...field}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={BODY_LIMIT + 200}
                  placeholder="Olá {{primeiro_nome}}, ..."
                />
                <p className="text-right text-caption text-ink-3">
                  {body.length}/{BODY_LIMIT}
                </p>
              </div>
            )}
          </FormField>
        </div>
      </ModalContent>
    </Modal>
  );
}
