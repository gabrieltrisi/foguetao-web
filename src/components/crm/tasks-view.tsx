"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Columns3, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { Combobox } from "@/components/ui/combobox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { OwnerBadge, PriorityBadge, StatusBadge } from "@/components/business/badges";
import { ListTodo } from "lucide-react";
import {
  tasks,
  taskStatusColumns,
  taskStatusLabel,
  taskStatusTone,
  tasksByStatus,
  calendarMonth,
} from "@/mocks/crm/tasks";
import type { Priority } from "@/types";
import type { Task } from "@/types/crm";

const priorityDot: Record<Priority, string> = { alta: "bg-danger", media: "bg-warning", baixa: "bg-info" };
const PRIORITY_OPTIONS = [
  { value: "todas", label: "Todas as prioridades" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function TasksView() {
  const [view, setView] = React.useState<"list" | "kanban" | "calendar">("list");
  const [query, setQuery] = React.useState("");
  const [priority, setPriority] = React.useState("todas");

  const filtered = tasks.filter((t) => {
    const matchPriority = priority === "todas" || t.priority === priority;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || `${t.title} ${t.assignee}`.toLowerCase().includes(q);
    return matchPriority && matchQuery;
  });

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tarefas…" containerClassName="w-full max-w-xs" />
        <div className="w-52">
          <Combobox options={PRIORITY_OPTIONS} value={priority} onValueChange={setPriority} />
        </div>
        <SegmentedControl
          className="ml-auto"
          options={[
            { value: "list", label: "Lista", icon: <List className="size-4" /> },
            { value: "kanban", label: "Kanban", icon: <Columns3 className="size-4" /> },
            { value: "calendar", label: "Calendário", icon: <CalendarDays className="size-4" /> },
          ]}
          value={view}
          onValueChange={setView}
        />
      </FilterBar>

      {view === "list" ? <TaskList tasks={filtered} /> : null}
      {view === "kanban" ? <TaskKanban query={query} priority={priority} /> : null}
      {view === "calendar" ? <TaskCalendar tasks={filtered} /> : null}
    </div>
  );
}

function TaskList({ tasks: rows }: { tasks: Task[] }) {
  const columns: DataTableColumn<Task>[] = [
    {
      id: "title",
      header: "Tarefa",
      sortable: true,
      sortAccessor: (t) => t.title,
      cell: (t) => (
        <div className="flex items-center gap-2.5">
          <Checkbox aria-label={t.title} defaultChecked={t.status === "done"} />
          <Link href={`/tasks/${t.id}`} className={cn("font-medium hover:text-brand", t.status === "done" ? "text-ink-3 line-through" : "text-ink")}>
            {t.title}
          </Link>
        </div>
      ),
    },
    { id: "assignee", header: "Responsável", cell: (t) => <OwnerBadge name={t.assignee} /> },
    { id: "due", header: "Prazo", cell: (t) => <span className="text-ink-2">{t.dueLabel}</span> },
    { id: "priority", header: "Prioridade", cell: (t) => <PriorityBadge priority={t.priority} /> },
    { id: "status", header: "Status", cell: (t) => <StatusBadge tone={taskStatusTone[t.status]}>{taskStatusLabel[t.status]}</StatusBadge> },
  ];
  return (
    <DataTable data={rows} columns={columns} getRowId={(t) => t.id} empty={{ icon: ListTodo, title: "Nenhuma tarefa encontrada." }} />
  );
}

function TaskKanban({ query, priority }: { query: string; priority: string }) {
  const match = (t: Task) => {
    const mp = priority === "todas" || t.priority === priority;
    const q = query.trim().toLowerCase();
    return mp && (!q || `${t.title} ${t.assignee}`.toLowerCase().includes(q));
  };
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {taskStatusColumns.map((col) => {
        const items = tasksByStatus(col.id).filter(match);
        return (
          <section key={col.id} className="flex flex-col rounded-xl border border-line bg-surface" aria-label={col.label}>
            <header className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <h3 className="text-body2 font-semibold text-ink">{col.label}</h3>
              <span className="rounded-full bg-white px-1.5 text-caption font-semibold text-ink-2">{items.length}</span>
            </header>
            <div className="flex flex-col gap-2.5 p-2.5">
              {items.map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="block rounded-lg border border-line bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                  <p className="font-medium text-ink">{t.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-caption text-ink-3">
                      <EntityAvatar name={t.assignee} size="sm" className="size-5 text-[9px]" />
                      {t.dueLabel}
                    </span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                </Link>
              ))}
              {items.length === 0 ? <p className="px-1 py-4 text-center text-caption text-ink-3">Vazio</p> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function buildWeeks(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function TaskCalendar({ tasks: items }: { tasks: Task[] }) {
  const { year, month } = calendarMonth;
  const weeks = buildWeeks(year, month);
  const byDay = new Map<number, Task[]>();
  for (const t of items) {
    const day = Number(t.due.slice(8, 10));
    byDay.set(day, [...(byDay.get(day) ?? []), t]);
  }
  const today = 13; // referência fixa: 13 jul 2026

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-display text-h3 font-semibold text-ink">
          {MONTH_NAMES[month]} de {year}
        </p>
      </div>
      <div className="grid grid-cols-7 border-b border-line bg-surface">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-caption font-semibold uppercase tracking-wide text-ink-3">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, i) => (
          <div
            key={i}
            className={cn(
              "min-h-24 border-b border-r border-line p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
              day === null && "bg-surface/50",
            )}
          >
            {day !== null ? (
              <>
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-caption font-medium",
                    day === today ? "bg-brand text-white" : "text-ink-2",
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {(byDay.get(day) ?? []).slice(0, 3).map((t) => (
                    <Link
                      key={t.id}
                      href={`/tasks/${t.id}`}
                      className="flex items-center gap-1 truncate rounded bg-surface px-1.5 py-0.5 text-micro text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand-dark"
                    >
                      <span className={cn("size-1.5 shrink-0 rounded-full", priorityDot[t.priority])} aria-hidden />
                      <span className="truncate">{t.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
