"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/business/badges";
import { queues } from "@/mocks/messaging/queues";
import type { Queue, QueueStatus } from "@/types/messaging";
import { PreviewBanner } from "@/components/messaging/preview-banner";

const statusTone: Record<QueueStatus, "success" | "warning" | "neutral"> = {
  online: "success",
  busy: "warning",
  paused: "neutral",
};
const statusLabel: Record<QueueStatus, string> = { online: "Online", busy: "Ocupada", paused: "Pausada" };

export function QueuesView() {
  const columns: DataTableColumn<Queue>[] = [
    { id: "name", header: "Fila", sortable: true, sortAccessor: (q) => q.name, cell: (q) => <span className="font-medium text-ink">{q.name}</span> },
    { id: "agents", header: "Atendentes", cell: (q) => `${q.agents}` },
    {
      id: "capacity",
      header: "Capacidade",
      cell: (q) => (
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface" aria-hidden>
            <span className={cn("block h-full rounded-full", q.waiting / q.capacity > 0.3 ? "bg-warning" : "bg-brand")} style={{ width: `${Math.min(100, ((q.agents * 5 + q.waiting) / q.capacity) * 100)}%` }} />
          </span>
          <span className="text-caption text-ink-3">{q.capacity}</span>
        </div>
      ),
    },
    { id: "waiting", header: "Na fila", sortable: true, sortAccessor: (q) => q.waiting, cell: (q) => <span className={cn("font-semibold tabular-nums", q.waiting > 5 ? "text-danger" : "text-ink")}>{q.waiting}</span> },
    { id: "avg", header: "Tempo médio", cell: (q) => <span className="tabular-nums text-ink-2">{q.avgTime}</span> },
    { id: "status", header: "Status", cell: (q) => <StatusBadge tone={statusTone[q.status]}>{statusLabel[q.status]}</StatusBadge> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PreviewBanner feature="Filas de atendimento" />
      <DataTable
      data={queues}
      columns={columns}
      getRowId={(q) => q.id}
      empty={{ icon: Layers, title: "Nenhuma fila configurada." }}
      />
    </div>
  );
}
