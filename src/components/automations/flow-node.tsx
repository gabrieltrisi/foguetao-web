"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeIcon, nodeCategoryStyle } from "@/components/automations/node-icon";
import { getNodeType } from "@/mocks/automations/nodes";
import type { FlowNode as FlowNodeType } from "@/types/automations";

export function FlowNode({
  node,
  selected,
  onSelect,
}: {
  node: FlowNodeType;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const type = getNodeType(node.typeId);
  const category = type?.category ?? "action";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-64 items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        selected ? "border-brand ring-2 ring-brand/20" : "border-line",
      )}
    >
      <NodeIcon name={type?.icon ?? "Workflow"} category={category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body2 font-semibold text-ink">{node.label}</p>
        {node.subtitle ? <p className="truncate text-caption text-ink-3">{node.subtitle}</p> : null}
      </div>
      <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-micro font-semibold uppercase tracking-wide", nodeCategoryStyle[category].icon)}>
        {nodeCategoryStyle[category].label}
      </span>
    </button>
  );
}

/** Conector vertical entre nós, com botão de adicionar (mock). */
export function FlowConnector({ label, onAdd }: { label?: string; onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <span className="h-4 w-px bg-line" aria-hidden />
      {label ? (
        <span className="rounded-full border border-line bg-white px-2 py-0.5 text-micro font-medium text-ink-2">{label}</span>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Adicionar nó"
          className="flex size-6 items-center justify-center rounded-full border border-line bg-white text-ink-3 transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      )}
      <span className="h-4 w-px bg-line" aria-hidden />
    </div>
  );
}
