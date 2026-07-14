"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Columns3, List, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Combobox } from "@/components/ui/combobox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { EntityAvatar } from "@/components/business/entity-avatar";
import { useSession } from "@/providers/session-provider";
import { useTasks } from "@/hooks/crm/use-tasks";
import { useAssignableMembers } from "@/hooks/crm/use-assignable-members";
import {
  taskStatusMeta,
  taskPriorityMeta,
  isOverdue,
  isDueSoon,
  formatTaskDate,
} from "@/lib/crm/task-helpers";
import type { ApiTask, TaskStatus, TaskPriority, TaskFilters } from "@/types/api/crm-tasks";

const LIST_PAGE_SIZE = 20;
/** Kanban/Calendário agrupam no cliente; usam o teto de paginação do backend. */
const BOARD_PAGE_SIZE = 100;

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  ...(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"] as TaskStatus[]).map((s) => ({
    value: s,
    label: taskStatusMeta[s].label,
  })),
];
const PRIORITY_OPTIONS = [
  { value: "todas", label: "Todas as prioridades" },
  ...(["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]).map((p) => ({
    value: p,
    label: taskPriorityMeta[p].label,
  })),
];
const OVERDUE_OPTIONS = [
  { value: "todas", label: "Todos os prazos" },
  { value: "true", label: "Somente atrasadas" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const KANBAN_COLUMNS: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export function TasksView() {
  const { can } = useSession();
  const [view, setView] = React.useState<"list" | "kanban" | "calendar">("list");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("todos");
  const [priority, setPriority] = React.useState("todas");
  const [assignee, setAssignee] = React.useState("todos");
  const [overdue, setOverdue] = React.useState("todas");
  const [page, setPage] = React.useState(1);

  const members = useAssignableMembers();

  // Busca textual com debounce (padrão do projeto) — reseta a página.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Somente filtros REAIS do ListTasksQueryDto.
  const filters: TaskFilters = {
    page: view === "list" ? page : 1,
    limit: view === "list" ? LIST_PAGE_SIZE : BOARD_PAGE_SIZE,
    search: search || undefined,
    status: status === "todos" ? undefined : (status as TaskStatus),
    priority: priority === "todas" ? undefined : (priority as TaskPriority),
    assignedToUserId: assignee === "todos" ? undefined : assignee,
    overdue: overdue === "true" ? true : undefined,
    sortBy: "dueAt",
    sortOrder: "asc",
  };

  const { data, isLoading, isError, refetch, isFetching } = useTasks(filters);

  if (!can("crm.tasks.read")) {
    return <p className="py-10 text-center text-body2 text-ink-3">Você não tem permissão para ver tarefas.</p>;
  }
  if (isError) {
    return <ErrorState title="Não foi possível carregar as tarefas." onRetry={() => refetch()} />;
  }

  const items = data?.items ?? [];
  /** Reseta a página ao trocar um filtro relevante. */
  const onFilter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterBar>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tarefas…"
          containerClassName="w-full max-w-xs"
        />
        <div className="w-44">
          <Combobox options={STATUS_OPTIONS} value={status} onValueChange={onFilter(setStatus)} />
        </div>
        <div className="w-48">
          <Combobox options={PRIORITY_OPTIONS} value={priority} onValueChange={onFilter(setPriority)} />
        </div>
        {members.canRead ? (
          <div className="w-48">
            <Combobox
              options={[{ value: "todos", label: "Todos os responsáveis" }, ...members.options]}
              value={assignee}
              onValueChange={onFilter(setAssignee)}
            />
          </div>
        ) : null}
        <div className="w-44">
          <Combobox options={OVERDUE_OPTIONS} value={overdue} onValueChange={onFilter(setOverdue)} />
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

      {view === "list" ? (
        <>
          <TaskList tasks={items} loading={isLoading} nameById={members.nameById} />
          {data && data.totalPages > 1 ? (
            <div className={cn("flex justify-end", isFetching && "opacity-60")}>
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      ) : null}
      {view === "kanban" ? <TaskKanban tasks={items} loading={isLoading} nameById={members.nameById} /> : null}
      {view === "calendar" ? <TaskCalendar tasks={items} /> : null}
    </div>
  );
}

/** Nome do responsável sem N+1: resolvido pelo mapa de membros já carregado. */
function assigneeName(nameById: Map<string, string>, userId: string): string {
  return nameById.get(userId) ?? "Responsável";
}

function TaskList({
  tasks,
  loading,
  nameById,
}: {
  tasks: ApiTask[];
  loading: boolean;
  nameById: Map<string, string>;
}) {
  const columns: DataTableColumn<ApiTask>[] = [
    {
      id: "title",
      header: "Tarefa",
      cell: (t) => {
        const done = t.status === "COMPLETED";
        const late = isOverdue(t);
        return (
          <div className="flex items-center gap-2">
            {late ? <AlertTriangle className="size-4 shrink-0 text-danger" aria-label="Atrasada" /> : null}
            <Link
              href={`/tasks/${t.id}`}
              className={cn("font-medium hover:text-brand", done ? "text-ink-3 line-through" : "text-ink")}
            >
              {t.title}
            </Link>
          </div>
        );
      },
    },
    {
      id: "assignee",
      header: "Responsável",
      cell: (t) => (
        <span className="inline-flex items-center gap-1.5">
          <EntityAvatar name={assigneeName(nameById, t.assignedToUserId)} size="sm" className="size-5 text-[9px]" />
          <span className="text-body2 text-ink">{assigneeName(nameById, t.assignedToUserId)}</span>
        </span>
      ),
    },
    {
      id: "due",
      header: "Prazo",
      cell: (t) => (
        <span className={cn("text-ink-2", isDueSoon(t) && "text-warning", isOverdue(t) && "font-medium text-danger")}>
          {formatTaskDate(t.dueAt)}
        </span>
      ),
    },
    { id: "priority", header: "Prioridade", cell: (t) => <Badge tone={taskPriorityMeta[t.priority].tone}>{taskPriorityMeta[t.priority].label}</Badge> },
    {
      id: "status",
      header: "Status",
      cell: (t) =>
        isOverdue(t) ? (
          <Badge tone="danger">Atrasada</Badge>
        ) : (
          <Badge tone={taskStatusMeta[t.status].tone}>{taskStatusMeta[t.status].label}</Badge>
        ),
    },
  ];

  return (
    <DataTable
      data={tasks}
      columns={columns}
      getRowId={(t) => t.id}
      loading={loading}
      pageSize={LIST_PAGE_SIZE}
      empty={{ icon: ListTodo, title: "Nenhuma tarefa encontrada.", description: "Ajuste os filtros ou crie uma nova tarefa." }}
    />
  );
}

/** Kanban agrupa por status as tarefas já carregadas (sem requests extras). */
function TaskKanban({
  tasks,
  loading,
  nameById,
}: {
  tasks: ApiTask[];
  loading: boolean;
  nameById: Map<string, string>;
}) {
  if (loading) return <p className="py-10 text-center text-body2 text-ink-3">Carregando…</p>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {KANBAN_COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col);
        return (
          <section key={col} className="flex flex-col rounded-xl border border-line bg-surface" aria-label={taskStatusMeta[col].label}>
            <header className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <h3 className="text-body2 font-semibold text-ink">{taskStatusMeta[col].label}</h3>
              <span className="rounded-full bg-white px-1.5 text-caption font-semibold text-ink-2">{items.length}</span>
            </header>
            <div className="flex flex-col gap-2.5 p-2.5">
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="block rounded-lg border border-line bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <p className={cn("font-medium", t.status === "COMPLETED" ? "text-ink-3 line-through" : "text-ink")}>
                    {t.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-caption text-ink-3">
                      <EntityAvatar name={assigneeName(nameById, t.assignedToUserId)} size="sm" className="size-5 text-[9px]" />
                      <span className={cn("truncate", isOverdue(t) && "font-medium text-danger")}>{formatTaskDate(t.dueAt)}</span>
                    </span>
                    <Badge tone={taskPriorityMeta[t.priority].tone}>{taskPriorityMeta[t.priority].label}</Badge>
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

const priorityDot: Record<TaskPriority, string> = {
  URGENT: "bg-danger",
  HIGH: "bg-warning",
  MEDIUM: "bg-info",
  LOW: "bg-ink-3",
};

/** Calendário do mês corrente; agrupa por dia LOCAL de `dueAt`. */
function TaskCalendar({ tasks }: { tasks: ApiTask[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const weeks = buildWeeks(year, month);

  const byDay = new Map<number, ApiTask[]>();
  for (const t of tasks) {
    if (!t.dueAt) continue;
    const d = new Date(t.dueAt);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const day = d.getDate();
    byDay.set(day, [...(byDay.get(day) ?? []), t]);
  }

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
