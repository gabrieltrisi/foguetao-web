"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { NodeIcon } from "@/components/automations/node-icon";
import { nodeTypes } from "@/mocks/automations/nodes";
import type { NodeCategory } from "@/types/automations";

const GROUPS: { cat: NodeCategory; label: string }[] = [
  { cat: "trigger", label: "Gatilhos" },
  { cat: "action", label: "Ações" },
  { cat: "logic", label: "Lógica" },
  { cat: "exit", label: "Saída" },
];

export function NodeLibrary({ onAdd, className }: { onAdd?: (typeId: string) => void; className?: string }) {
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const filtered = nodeTypes.filter((n) => !query || n.label.toLowerCase().includes(query));

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-line p-3">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nó…" />
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto p-2">
        {GROUPS.map((group) => {
          const items = filtered.filter((n) => n.category === group.cat);
          if (items.length === 0) return null;
          return (
            <div key={group.cat} className="mb-3">
              <p className="px-2 py-1 text-caption font-semibold uppercase tracking-wide text-ink-3">{group.label}</p>
              <ul className="flex flex-col gap-1">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onAdd?.(n.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <NodeIcon name={n.icon} category={n.category} className="size-8" />
                      <span className="min-w-0 flex-1 truncate text-body2 text-ink">{n.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
