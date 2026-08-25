"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Combobox, MultiSelect } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { optionsOf, typeLabel, type FieldFormValue } from "@/lib/crm/custom-fields";
import type { ApiCustomFieldDef } from "@/types/api/crm";

/**
 * Renderiza o controle de UM campo personalizado conforme o tipo REAL da
 * definição. Cobre os 12 tipos do enum — não existe CURRENCY.
 */
export function CustomFieldInput({
  def,
  value,
  onChange,
  disabled,
}: {
  def: ApiCustomFieldDef;
  value: FieldFormValue;
  onChange: (value: FieldFormValue) => void;
  disabled?: boolean;
}) {
  const id = `cf-${def.key}`;
  const options = optionsOf(def).map((o) => ({ value: o, label: o }));
  const text = typeof value === "string" ? value : "";

  return (
    <FormField
      id={id}
      label={def.name}
      required={def.required}
      description={def.description ?? undefined}
    >
      {(p) => {
        switch (def.type) {
          case "TEXTAREA":
            return (
              <Textarea
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "BOOLEAN":
            return (
              <Switch
                checked={value === true}
                disabled={disabled}
                onCheckedChange={(c) => onChange(c)}
                aria-label={def.name}
                id={p.id}
              />
            );

          case "SELECT":
            return (
              <Combobox
                id={p.id}
                options={[{ value: "", label: "—" }, ...options]}
                value={text}
                disabled={disabled}
                onValueChange={(v) => onChange(v)}
              />
            );

          case "MULTISELECT":
            return (
              <MultiSelect
                id={p.id}
                options={options}
                value={Array.isArray(value) ? value : []}
                disabled={disabled}
                onValueChange={(v) => onChange(v)}
              />
            );

          case "NUMBER":
            return (
              <Input
                inputMode="decimal"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "DATE":
            return (
              <Input
                type="date"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "DATETIME":
            return (
              <Input
                type="datetime-local"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "EMAIL":
            return (
              <Input
                type="email"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "PHONE":
            return (
              <Input
                type="tel"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "URL":
            return (
              <Input
                type="url"
                placeholder="https://…"
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "JSON":
            return (
              <Textarea
                className="font-mono text-caption"
                placeholder='{ "chave": "valor" }'
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                {...p}
              />
            );

          case "TEXT":
          default:
            return (
              <Input
                value={text}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                aria-label={def.type === "TEXT" ? undefined : typeLabel(def.type)}
                {...p}
              />
            );
        }
      }}
    </FormField>
  );
}
