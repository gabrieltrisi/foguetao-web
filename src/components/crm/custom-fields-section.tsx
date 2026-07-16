"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatList } from "@/components/business/kpi-block";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useCustomFieldDefsFor } from "@/hooks/crm/use-custom-fields";
import { CustomFieldInput } from "@/components/crm/custom-field-input";
import {
  activeDefs,
  buildForm,
  displayValue,
  messageForCustomFieldError,
  missingRequired,
  serializeValues,
  type CustomFieldForm,
  type FieldFormValue,
} from "@/lib/crm/custom-fields";
import type { ApiCustomFieldValue, CustomFieldEntity } from "@/types/api/crm";

/**
 * Seção "Campos personalizados" do detalhe de contato/organização. As
 * definições vêm de `GET /custom-fields?entityType=`; os valores são gravados
 * em LOTE (PUT) — campo vazio vira `null`, que é como o contrato limpa.
 */
export function CustomFieldsSection({
  entityType,
  values,
  valuesLoading,
  valuesError,
  canEdit,
  onSave,
  saving,
}: {
  entityType: CustomFieldEntity;
  values: readonly ApiCustomFieldValue[];
  valuesLoading?: boolean;
  valuesError?: boolean;
  canEdit: boolean;
  onSave: (payload: Record<string, unknown>) => Promise<unknown>;
  saving?: boolean;
}) {
  const { toast } = useToast();
  const { can } = useSession();
  const defsQuery = useCustomFieldDefsFor(entityType);
  const [editing, setEditing] = React.useState(false);

  const defs = React.useMemo(() => activeDefs(defsQuery.data ?? []), [defsQuery.data]);

  if (!can("crm.custom_fields.read")) return null;

  const title = (
    <div className="flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-display text-h3 font-semibold text-ink">
        <SlidersHorizontal className="size-4 text-ink-3" aria-hidden />
        Campos personalizados
      </h3>
      {!editing && canEdit && defs.length > 0 ? (
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="size-4" aria-hidden />
          Editar
        </Button>
      ) : null}
    </div>
  );

  if (defsQuery.isLoading || valuesLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {title}
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    );
  }

  if (defsQuery.isError || valuesError) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {title}
        <p role="alert" className="text-body2 text-danger">
          Não foi possível carregar os campos personalizados.
        </p>
      </Card>
    );
  }

  if (defs.length === 0) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {title}
        <p className="text-body2 text-ink-3">
          Nenhum campo personalizado definido para {entityType === "CONTACT" ? "contatos" : "organizações"}.
          {can("crm.custom_fields.create") ? (
            <>
              {" "}
              <Link href="/custom-fields" className="font-medium text-brand hover:underline">
                Criar um campo
              </Link>
              .
            </>
          ) : null}
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      {title}
      {editing ? (
        <CustomFieldsEditor
          defs={defs}
          values={values}
          saving={saving}
          onCancel={() => setEditing(false)}
          onSubmit={async (payload) => {
            try {
              await onSave(payload);
              toast({ title: "Campos personalizados atualizados", variant: "success" });
              setEditing(false);
            } catch (error) {
              toast({ title: messageForCustomFieldError(error), variant: "error" });
            }
          }}
        />
      ) : (
        <StatList
          items={defs.map((def) => {
            const found = values.find((v) => v.key === def.key);
            return {
              label: def.name,
              value: (
                <span className="break-words text-right">{displayValue(def.type, found?.value)}</span>
              ),
            };
          })}
        />
      )}
    </Card>
  );
}

function CustomFieldsEditor({
  defs,
  values,
  saving,
  onCancel,
  onSubmit,
}: {
  defs: ReturnType<typeof activeDefs>;
  values: readonly ApiCustomFieldValue[];
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const { toast } = useToast();
  // `key` no componente pai remontaria; aqui o estado inicial basta.
  const [form, setForm] = React.useState<CustomFieldForm>(() => buildForm(defs, values));

  const set = (key: string) => (v: FieldFormValue) => setForm((f) => ({ ...f, [key]: v }));

  function handleSubmit() {
    let payload: Record<string, unknown>;
    try {
      payload = serializeValues(defs, form);
    } catch (error) {
      toast({ title: messageForCustomFieldError(error), variant: "error" });
      return;
    }
    // espelha o enforce de `required` do backend, antes de sair da rede
    const missing = missingRequired(defs, payload);
    if (missing.length > 0) {
      toast({ title: `Campo obrigatório: ${missing[0].name}`, variant: "error" });
      return;
    }
    onSubmit(payload);
  }

  return (
    <div className="flex flex-col gap-4">
      {defs.map((def) => (
        <CustomFieldInput
          key={def.key}
          def={def}
          value={form[def.key]}
          onChange={set(def.key)}
          disabled={saving}
        />
      ))}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button size="sm" loading={saving} onClick={handleSubmit}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
