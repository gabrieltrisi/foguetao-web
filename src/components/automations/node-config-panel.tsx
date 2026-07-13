"use client";

import { Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { NodeIcon, nodeCategoryStyle } from "@/components/automations/node-icon";
import { getNodeType } from "@/mocks/automations/nodes";
import type { FlowNode } from "@/types/automations";

export function NodeConfigPanel({
  node,
  onRemove,
}: {
  node?: FlowNode;
  onRemove?: () => void;
}) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <Settings2 className="size-6 text-ink-3" aria-hidden />
        <p className="text-body2 text-ink-3">Selecione um nó para configurar.</p>
      </div>
    );
  }

  const type = getNodeType(node.typeId);
  const category = type?.category ?? "action";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <NodeIcon name={type?.icon ?? "Workflow"} category={category} />
        <div className="min-w-0">
          <p className="truncate font-display text-h3 font-semibold text-ink">{node.label}</p>
          <p className="text-caption text-ink-3">{nodeCategoryStyle[category].label} · {type?.description}</p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <FormField id="node-name" label="Nome do nó">
            {(p) => <Input defaultValue={node.label} {...p} />}
          </FormField>
          {(node.config ?? []).map((c, i) => (
            <FormField key={i} id={`node-cfg-${i}`} label={c.label}>
              {(p) => <Input defaultValue={c.value} {...p} />}
            </FormField>
          ))}
          {node.config === undefined || node.config.length === 0 ? (
            <FormField id="node-note" label="Observação">
              {(p) => <Input placeholder="Sem configuração adicional" {...p} />}
            </FormField>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line p-4">
        <Button variant="ghost" size="sm" className="w-full text-danger" onClick={onRemove}>
          <Trash2 />
          Remover nó
        </Button>
      </div>
    </div>
  );
}
