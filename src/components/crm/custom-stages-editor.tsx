"use client";

import * as React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { stageCategoryLabel } from "@/lib/crm/pipeline-setup";
import type { CustomStageInput, StageCategory } from "@/types/api/crm-deals";

const CATEGORY_OPTIONS = (["OPEN", "WON", "LOST"] as StageCategory[]).map((c) => ({
  value: c,
  label: stageCategoryLabel[c],
}));

export const DEFAULT_CUSTOM_STAGES: CustomStageInput[] = [
  { name: "Novo lead", category: "OPEN", probability: 10 },
  { name: "Proposta", category: "OPEN", probability: 50 },
  { name: "Ganho", category: "WON", probability: 100 },
  { name: "Perdido", category: "LOST", probability: 0 },
];

/**
 * Editor das etapas de um setup CUSTOM: nome, categoria e probabilidade.
 * A validação das invariantes (>=1 OPEN, 1 WON, 1 LOST) fica em
 * `validateCustomStages` e é exibida pelo componente pai.
 */
export function CustomStagesEditor({
  stages,
  onChange,
}: {
  stages: CustomStageInput[];
  onChange: (stages: CustomStageInput[]) => void;
}) {
  const update = (i: number, patch: Partial<CustomStageInput>) =>
    onChange(stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const remove = (i: number) => onChange(stages.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= stages.length) return;
    const next = [...stages];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {stages.map((s, i) => (
          <div key={i} className="grid grid-cols-1 items-end gap-2 rounded-lg border border-line p-3 sm:grid-cols-[1fr_140px_110px_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`stage-name-${i}`}>Etapa {i + 1}</Label>
              <Input
                id={`stage-name-${i}`}
                value={s.name}
                placeholder="Nome da etapa"
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`stage-cat-${i}`}>Categoria</Label>
              <Combobox
                id={`stage-cat-${i}`}
                options={CATEGORY_OPTIONS}
                value={s.category}
                onValueChange={(v) => update(i, { category: v as StageCategory })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`stage-prob-${i}`}>Prob. (%)</Label>
              <Input
                id={`stage-prob-${i}`}
                type="number"
                min={0}
                max={100}
                value={s.probability ?? ""}
                onChange={(e) =>
                  update(i, { probability: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="ghost" aria-label={`Mover etapa ${i + 1} para cima`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="size-4" aria-hidden />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Mover etapa ${i + 1} para baixo`} disabled={i === stages.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="size-4" aria-hidden />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Remover etapa ${i + 1}`} onClick={() => remove(i)}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="w-fit"
        onClick={() => onChange([...stages, { name: "", category: "OPEN", probability: 50 }])}
      >
        <Plus className="size-4" aria-hidden /> Adicionar etapa
      </Button>
    </div>
  );
}
