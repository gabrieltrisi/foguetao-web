"use client";

import { Clock, Inbox, Timer, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPIBlock } from "@/components/business/kpi-block";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { OwnerBadge, PriorityBadge } from "@/components/business/badges";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useToast } from "@/components/ui/toast";
import { inboxQueue, queues } from "@/mocks/messaging/queues";
import type { Priority } from "@/types";

type Row = {
  id: string;
  contact: string;
  queue: string;
  agent: string;
  priority: Priority;
  waiting: string;
};

const rows: Row[] = inboxQueue.map((r) => ({ ...r, priority: r.priority as Priority }));

export function InboxView() {
  const { toast } = useToast();
  const waitingTotal = queues.reduce((s, q) => s + q.waiting, 0);
  const agentsTotal = queues.reduce((s, q) => s + q.agents, 0);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "contact",
      header: "Contato",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={r.contact} size="sm" />
          <span className="font-medium text-ink">{r.contact}</span>
        </div>
      ),
    },
    { id: "queue", header: "Fila", cell: (r) => r.queue },
    { id: "agent", header: "Responsável", cell: (r) => (r.agent === "—" ? <span className="text-ink-3">Sem responsável</span> : <OwnerBadge name={r.agent} />) },
    { id: "priority", header: "Prioridade", cell: (r) => <PriorityBadge priority={r.priority} /> },
    {
      id: "waiting",
      header: "Espera",
      sortable: true,
      sortAccessor: (r) => r.waiting,
      cell: (r) => <span className="inline-flex items-center gap-1 tabular-nums text-ink-2"><Clock className="size-3.5 text-ink-3" aria-hidden />{r.waiting}</span>,
    },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "text-right",
      cell: () => (
        <Button size="sm" onClick={() => toast({ title: "Atendimento iniciado (mock)", variant: "success" })}>
          Atender
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand"><Inbox className="size-5" aria-hidden /></span>
          <KPIBlock label="Em espera" value={String(waitingTotal)} />
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info"><Timer className="size-5" aria-hidden /></span>
          <KPIBlock label="Tempo médio" value="3m 12s" delta="-8%" trend="up" />
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success"><Users className="size-5" aria-hidden /></span>
          <KPIBlock label="Atendentes" value={String(agentsTotal)} />
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning"><Clock className="size-5" aria-hidden /></span>
          <KPIBlock label="Resolvidas hoje" value="128" delta="+12%" trend="up" />
        </Card>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        pageSize={8}
        empty={{ icon: Inbox, title: "Fila vazia." }}
      />
    </div>
  );
}
