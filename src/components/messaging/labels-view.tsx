"use client";

import * as React from "react";
import { Check, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { labelColorClasses } from "@/components/messaging/label-chip";
import { labels as initialLabels } from "@/mocks/messaging/labels";
import type { Label, LabelColor } from "@/types/messaging";
import { PreviewBanner } from "@/components/messaging/preview-banner";

const COLORS: LabelColor[] = ["brand", "info", "success", "warning", "danger", "neutral"];

function ColorPicker({ value, onChange }: { value: LabelColor; onChange: (c: LabelColor) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da etiqueta">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            labelColorClasses[c].solid,
            value === c && "ring-2 ring-ink ring-offset-2",
          )}
        >
          {value === c ? <Check className="size-4" aria-hidden /> : null}
        </button>
      ))}
    </div>
  );
}

function LabelDialog({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: Label;
  onSave: (name: string, color: LabelColor) => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [color, setColor] = React.useState<LabelColor>(initial?.color ?? "brand");
  return (
    <Modal>
      <ModalTrigger asChild>{trigger}</ModalTrigger>
      <ModalContent
        title={initial ? "Editar etiqueta" : "Nova etiqueta"}
        description="Defina um nome e uma cor."
        footer={
          <>
            <ModalClose asChild>
              <Button size="sm" variant="secondary">Cancelar</Button>
            </ModalClose>
            <ModalClose asChild>
              <Button size="sm" disabled={!name.trim()} onClick={() => onSave(name.trim(), color)}>
                Salvar
              </Button>
            </ModalClose>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField id="lbl-name" label="Nome">
            {(p) => <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Urgente" {...p} />}
          </FormField>
          <div className="flex flex-col gap-1.5">
            <span className="text-body2 font-semibold text-ink">Cor</span>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium", labelColorClasses[color].chip)}>
              <span className={cn("size-1.5 rounded-full", labelColorClasses[color].dot)} aria-hidden />
              {name || "Prévia"}
            </span>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

export function LabelsView() {
  const { toast } = useToast();
  // Estado LOCAL: não há endpoint de etiquetas — nada é persistido (Preview).
  const [labels, setLabels] = React.useState<Label[]>(initialLabels);
  const maxCount = Math.max(...labels.map((l) => l.count), 1);

  return (
    <div className="flex flex-col gap-4">
      <PreviewBanner feature="Etiquetas de conversa" />
      <div className="flex justify-end">
        <LabelDialog
          trigger={
            <Button size="sm">
              <Plus />
              Nova etiqueta
            </Button>
          }
          onSave={(name, color) => {
            setLabels((prev) => [...prev, { id: `lbl-${prev.length + 1}-${name}`, name, color, count: 0 }]);
            toast({ title: "Etiqueta criada (mock)", variant: "success" });
          }}
        />
      </div>

      <Card className="divide-y divide-line">
        {labels.map((l) => (
          <div key={l.id} className="flex items-center gap-4 p-4">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-body2 font-medium", labelColorClasses[l.color].chip)}>
              <span className={cn("size-2 rounded-full", labelColorClasses[l.color].dot)} aria-hidden />
              {l.name}
            </span>
            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface" aria-hidden>
                <span className={cn("block h-full rounded-full", labelColorClasses[l.color].solid)} style={{ width: `${(l.count / maxCount) * 100}%` }} />
              </span>
              <span className="whitespace-nowrap text-caption text-ink-3">{l.count} usos</span>
            </div>
            <span className="ml-auto text-caption text-ink-2 sm:hidden">{l.count}</span>
            <div className="flex items-center gap-1">
              <LabelDialog
                initial={l}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Editar ${l.name}`}>
                    <Pencil />
                  </Button>
                }
                onSave={(name, color) => {
                  setLabels((prev) => prev.map((x) => (x.id === l.id ? { ...x, name, color } : x)));
                  toast({ title: "Etiqueta atualizada (mock)", variant: "success" });
                }}
              />
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${l.name}`} className="text-ink-2 hover:text-danger">
                    <Trash2 />
                  </Button>
                }
                title={`Excluir "${l.name}"?`}
                description="A etiqueta será removida das conversas."
                confirmLabel="Excluir"
                destructive
                onConfirm={() => {
                  setLabels((prev) => prev.filter((x) => x.id !== l.id));
                  toast({ title: "Etiqueta excluída (mock)", variant: "warning" });
                }}
              />
            </div>
          </div>
        ))}
        {labels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Tag className="size-6 text-ink-3" aria-hidden />
            <p className="text-body2 text-ink-3">Nenhuma etiqueta criada.</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
