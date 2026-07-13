"use client";

import * as React from "react";
import { Fragment } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowNode, FlowConnector } from "@/components/automations/flow-node";
import { getNodeType } from "@/mocks/automations/nodes";
import type { FlowNode as FlowNodeType, NodeCategory } from "@/types/automations";

const dotColor: Record<NodeCategory, string> = {
  trigger: "bg-brand",
  action: "bg-info",
  logic: "bg-warning",
  exit: "bg-ink-3",
};

export function FlowCanvas({
  nodes,
  selectedId,
  onSelect,
  className,
}: {
  nodes: FlowNodeType[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const [zoom, setZoom] = React.useState(1);

  return (
    <div className={cn("relative h-[560px] overflow-hidden rounded-xl border border-line bg-surface", className)}>
      {/* Grade pontilhada */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(var(--color-line) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative h-full overflow-auto p-8">
        <div
          className="mx-auto flex w-fit flex-col items-center transition-transform"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          {nodes.map((node, i) => {
            const type = getNodeType(node.typeId);
            const isCondition = type?.category === "logic" && node.typeId === "lgc-condition";
            return (
              <Fragment key={node.id}>
                <FlowNode node={node} selected={node.id === selectedId} onSelect={() => onSelect?.(node.id)} />
                {i < nodes.length - 1 ? <FlowConnector label={isCondition ? "Sim" : undefined} /> : null}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Controles de zoom */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <button type="button" aria-label="Aproximar" onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.2) * 10) / 10))} className="flex size-8 items-center justify-center text-ink-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <ZoomIn className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Afastar" onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))} className="flex size-8 items-center justify-center border-y border-line text-ink-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <ZoomOut className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Ajustar" onClick={() => setZoom(1)} className="flex size-8 items-center justify-center text-ink-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <Maximize2 className="size-4" aria-hidden />
        </button>
      </div>
      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-0.5 text-caption text-ink-3 shadow-sm">{Math.round(zoom * 100)}%</span>

      {/* Mini-map */}
      <div className="absolute bottom-3 right-3 hidden w-24 flex-col items-center gap-1 rounded-lg border border-line bg-white/95 p-2 shadow-sm sm:flex" aria-hidden>
        <span className="text-micro font-medium uppercase tracking-wide text-ink-3">Mapa</span>
        <div className="flex flex-col items-center gap-1">
          {nodes.map((node) => {
            const cat = getNodeType(node.typeId)?.category ?? "action";
            return <span key={node.id} className={cn("h-1.5 w-10 rounded-full", dotColor[cat])} />;
          })}
        </div>
      </div>
    </div>
  );
}
