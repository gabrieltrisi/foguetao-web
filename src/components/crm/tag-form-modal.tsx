"use client";

import * as React from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useCreateTag, useUpdateTag } from "@/hooks/crm/use-tags";
import { messageForTagError } from "@/lib/crm/tag-errors";
import type { ApiTag } from "@/types/api/crm";

/** Mesma regra do backend (@Matches do CreateTagDto). */
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Criação/edição de tag. Só os campos REAIS do contrato: name, color (HEX
 * opcional) e description. Sem `key` (a tag não tem) e sem inventar nada.
 */
export function TagFormModal({
  open,
  onOpenChange,
  tag,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ausente → criação; presente → edição. */
  tag?: ApiTag;
}) {
  const isEdit = Boolean(tag);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ModalContent
          title={isEdit ? "Editar etiqueta" : "Nova etiqueta"}
          description={
            isEdit ? "Atualize os dados da etiqueta." : "Crie uma etiqueta para marcar contatos."
          }
        >
          {/* `key` remonta o formulário a cada abertura/troca de tag */}
          <TagFormFields key={tag?.id ?? "new"} tag={tag} onDone={() => onOpenChange(false)} />
        </ModalContent>
      ) : null}
    </Modal>
  );
}

function TagFormFields({ tag, onDone }: { tag?: ApiTag; onDone: () => void }) {
  const { toast } = useToast();
  const isEdit = Boolean(tag);
  const create = useCreateTag();
  const update = useUpdateTag();

  const [name, setName] = React.useState(tag?.name ?? "");
  const [color, setColor] = React.useState(tag?.color ?? "");
  const [description, setDescription] = React.useState(tag?.description ?? "");

  const pending = create.isPending || update.isPending;
  const trimmedColor = color.trim();
  const colorInvalid = trimmedColor.length > 0 && !HEX.test(trimmedColor);

  async function handleSave() {
    const body = {
      name: name.trim(),
      // vazio → omitido (o contrato trata color/description como opcionais)
      color: trimmedColor || undefined,
      description: description.trim() || undefined,
    };
    try {
      if (isEdit && tag) {
        await update.mutateAsync({ id: tag.id, body });
        toast({ title: "Etiqueta atualizada", variant: "success" });
      } else {
        await create.mutateAsync(body);
        toast({ title: "Etiqueta criada", variant: "success" });
      }
      onDone();
    } catch (error) {
      toast({ title: messageForTagError(error), variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField id="tf-name" label="Nome" required>
        {(p) => (
          <Input
            placeholder="Ex.: VIP"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            {...p}
          />
        )}
      </FormField>

      <FormField
        id="tf-color"
        label="Cor"
        description="HEX opcional: #FF8800 ou #F80"
        error={colorInvalid ? "Cor deve ser HEX (#RGB ou #RRGGBB)" : undefined}
      >
        {(p) => (
          <div className="flex items-center gap-2">
            <Input
              placeholder="#FF8800"
              maxLength={7}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              {...p}
            />
            <span
              aria-hidden
              className="size-8 shrink-0 rounded-md border border-line"
              style={{ backgroundColor: HEX.test(trimmedColor) ? trimmedColor : undefined }}
            />
          </div>
        )}
      </FormField>

      <FormField id="tf-desc" label="Descrição">
        {(p) => (
          <Textarea
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            {...p}
          />
        )}
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button
          size="sm"
          loading={pending}
          disabled={!name.trim() || colorInvalid}
          onClick={handleSave}
        >
          {isEdit ? "Salvar" : "Criar etiqueta"}
        </Button>
      </div>
    </div>
  );
}
