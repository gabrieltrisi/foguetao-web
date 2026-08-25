"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useCreateCustomFieldDef, useUpdateCustomFieldDef } from "@/hooks/crm/use-custom-fields";
import {
  CUSTOM_FIELD_TYPES,
  customFieldEntityLabel,
  messageForCustomFieldError,
  optionsOf,
  requiresOptions,
  typeLabel,
} from "@/lib/crm/custom-fields";
import type { ApiCustomFieldDef, CustomFieldEntity } from "@/types/api/crm";
import type { CustomFieldDefInput } from "@/lib/api/crm/client";

const KEY_RE = /^[a-z][a-z0-9_]{0,79}$/;

const TYPE_OPTIONS = CUSTOM_FIELD_TYPES.map((t) => ({ value: t, label: typeLabel(t) }));
const ENTITY_OPTIONS: { value: CustomFieldEntity; label: string }[] = [
  { value: "CONTACT", label: customFieldEntityLabel.CONTACT },
  { value: "ORGANIZATION", label: customFieldEntityLabel.ORGANIZATION },
];

/**
 * Criação/edição de definição. Só campos do contrato real: entityType, name,
 * key, type, description, required, active, options, position. `validation` NÃO
 * é exposto — o backend o armazena mas não o usa na validação.
 *
 * Regras do contrato refletidas aqui: `key` e `entityType` só na criação
 * (imutáveis depois) e `options` obrigatório para SELECT/MULTISELECT.
 */
export function CustomFieldFormModal({
  open,
  onOpenChange,
  def,
  /** Trava a troca de tipo: o backend recusa (409) se já houver valores. */
  typeLocked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  def?: ApiCustomFieldDef;
  typeLocked?: boolean;
}) {
  const isEdit = Boolean(def);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ModalContent
          title={isEdit ? "Editar campo personalizado" : "Novo campo personalizado"}
          description={
            isEdit
              ? "A key e a entidade não podem ser alteradas."
              : "Defina como o campo será preenchido em contatos ou organizações."
          }
          className="max-w-lg"
        >
          <Fields
            key={def?.id ?? "new"}
            def={def}
            typeLocked={typeLocked}
            onDone={() => onOpenChange(false)}
          />
        </ModalContent>
      ) : null}
    </Modal>
  );
}

function Fields({
  def,
  typeLocked,
  onDone,
}: {
  def?: ApiCustomFieldDef;
  typeLocked?: boolean;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const isEdit = Boolean(def);
  const create = useCreateCustomFieldDef();
  const update = useUpdateCustomFieldDef();

  const [entityType, setEntityType] = React.useState<string>(def?.entityType ?? "CONTACT");
  const [name, setName] = React.useState(def?.name ?? "");
  const [key, setKey] = React.useState(def?.key ?? "");
  const [type, setType] = React.useState<string>(def?.type ?? "TEXT");
  const [description, setDescription] = React.useState(def?.description ?? "");
  const [required, setRequired] = React.useState(def?.required ?? false);
  const [active, setActive] = React.useState(def?.active ?? true);
  const [options, setOptions] = React.useState<string[]>(def ? optionsOf(def) : []);
  const [optionDraft, setOptionDraft] = React.useState("");
  // `key` é gerada a partir do nome só até o usuário digitar a key à mão.
  const [keyTouched, setKeyTouched] = React.useState(isEdit);

  const pending = create.isPending || update.isPending;
  const needsOptions = requiresOptions(type);
  const keyInvalid = key.length > 0 && !KEY_RE.test(key);
  const optionsMissing = needsOptions && options.length === 0;

  function onNameChange(v: string) {
    setName(v);
    if (!keyTouched) setKey(slugKey(v));
  }

  function addOption() {
    const v = optionDraft.trim();
    if (!v || options.includes(v)) return;
    setOptions((o) => [...o, v]);
    setOptionDraft("");
  }

  async function handleSave() {
    try {
      if (isEdit && def) {
        // key/entityType são imutáveis → não vão no PATCH
        const body: CustomFieldDefInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          required,
          active,
          ...(typeLocked ? {} : { type }),
          ...(needsOptions ? { options } : {}),
        };
        await update.mutateAsync({ id: def.id, body });
        toast({ title: "Campo atualizado", variant: "success" });
      } else {
        const body: CustomFieldDefInput = {
          entityType,
          name: name.trim(),
          key: key.trim(),
          type,
          description: description.trim() || undefined,
          required,
          active,
          ...(needsOptions ? { options } : {}),
        };
        await create.mutateAsync(body);
        toast({ title: "Campo criado", variant: "success" });
      }
      onDone();
    } catch (error) {
      toast({ title: messageForCustomFieldError(error), variant: "error" });
    }
  }

  return (
    <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
      <FormField id="cf-name" label="Nome" required>
        {(p) => (
          <Input
            placeholder="Ex.: Segmento"
            maxLength={120}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            {...p}
          />
        )}
      </FormField>

      <FormField
        id="cf-key"
        label="Key"
        required
        description={
          isEdit
            ? "A key é imutável após a criação."
            : "Identificador estável: minúsculas, dígitos e _"
        }
        error={keyInvalid ? "Use apenas minúsculas, dígitos e _ , começando por letra" : undefined}
      >
        {(p) => (
          <Input
            placeholder="segmento"
            maxLength={80}
            value={key}
            disabled={isEdit}
            onChange={(e) => {
              setKeyTouched(true);
              setKey(e.target.value);
            }}
            {...p}
          />
        )}
      </FormField>

      <FormField
        id="cf-entity"
        label="Entidade"
        description={isEdit ? "A entidade é definida na criação." : undefined}
      >
        {(p) => (
          <Combobox
            id={p.id}
            options={ENTITY_OPTIONS}
            value={entityType}
            disabled={isEdit}
            onValueChange={setEntityType}
          />
        )}
      </FormField>

      <FormField
        id="cf-type"
        label="Tipo"
        description={typeLocked ? "O tipo não pode mudar: já existem valores gravados." : undefined}
      >
        {(p) => (
          <Combobox
            id={p.id}
            options={TYPE_OPTIONS}
            value={type}
            disabled={typeLocked}
            onValueChange={(v) => setType(v)}
          />
        )}
      </FormField>

      {needsOptions ? (
        <FormField
          id="cf-options"
          label="Opções"
          required
          description="Obrigatório para Seleção e Múltipla seleção."
          error={optionsMissing ? "Adicione ao menos uma opção" : undefined}
        >
          {(p) => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Nova opção"
                  value={optionDraft}
                  onChange={(e) => setOptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  {...p}
                />
                <Button size="sm" variant="secondary" onClick={addOption} disabled={!optionDraft.trim()}>
                  <Plus className="size-4" aria-hidden />
                  Adicionar
                </Button>
              </div>
              {options.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {options.map((o) => (
                    <li
                      key={o}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-2.5 pr-1 text-caption text-ink-2"
                    >
                      {o}
                      <button
                        type="button"
                        aria-label={`Remover opção ${o}`}
                        onClick={() => setOptions((list) => list.filter((x) => x !== o))}
                        className="flex size-4 items-center justify-center rounded-full text-ink-3 hover:bg-line hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <X className="size-3" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </FormField>
      ) : null}

      <FormField id="cf-desc" label="Descrição">
        {(p) => (
          <Input
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            {...p}
          />
        )}
      </FormField>

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="cf-required" className="text-body2 text-ink-2">
          Obrigatório
        </label>
        <Switch id="cf-required" checked={required} onCheckedChange={setRequired} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="cf-active" className="text-body2 text-ink-2">
          Ativo
        </label>
        <Switch id="cf-active" checked={active} onCheckedChange={setActive} />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button
          size="sm"
          loading={pending}
          disabled={!name.trim() || !key.trim() || keyInvalid || optionsMissing}
          onClick={handleSave}
        >
          {isEdit ? "Salvar" : "Criar campo"}
        </Button>
      </div>
    </div>
  );
}

/** "Segmento Principal" → "segmento_principal" (mesma regra da key real). */
function slugKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "")
    .slice(0, 80);
}
