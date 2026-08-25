"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useTasks, useCompleteTask } from "@/hooks/crm/use-tasks";
import { useAssignableMembers } from "@/hooks/crm/use-assignable-members";
import { messageForTaskError, taskPriorityMeta, formatTaskDate } from "@/lib/crm/task-helpers";
import type { ApiTask } from "@/types/api/crm-tasks";

const LIMIT = 4;

/**
 * Tarefas pendentes reais (`GET /tasks?status=PENDING`, ordenadas por
 * vencimento). Concluir usa o endpoint dedicado `POST /tasks/:id/complete`
 * (sem body) — o backend é a autoridade sobre o estado.
 */
export function PendingTasks() {
  const { can } = useSession();

  const { data, isLoading, isError } = useTasks({
    status: "PENDING",
    sortBy: "dueAt",
    sortOrder: "asc",
    limit: LIMIT,
  });
  const members = useAssignableMembers();

  const header = (
    <SectionHeader
      title="Tarefas pendentes"
      action={
        <Link href="/tasks" className="text-body2 font-medium text-brand hover:text-brand-dark">
          Ver todas
        </Link>
      }
    />
  );

  if (!can("crm.tasks.read")) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">Você não tem permissão para ver tarefas.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        {header}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p role="alert" className="mt-6 text-body2 text-danger">
          Não foi possível carregar as tarefas.
        </p>
      </Card>
    );
  }

  const tasks = data?.items ?? [];
  const canComplete = can("crm.tasks.complete");
  const nameOf = (userId: string) => members.nameById.get(userId) ?? "—";

  if (tasks.length === 0) {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-6 text-body2 text-ink-3">Nenhuma tarefa pendente.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col p-5">
      {header}
      <ul className="mt-4 flex flex-col gap-3">
        {tasks.map((task) => (
          <PendingTaskRow
            key={task.id}
            task={task}
            assignee={nameOf(task.assignedToUserId)}
            canComplete={canComplete}
          />
        ))}
      </ul>
    </Card>
  );
}

/** Uma linha por tarefa: cada uma tem a sua mutation (o hook é por id). */
function PendingTaskRow({
  task,
  assignee,
  canComplete,
}: {
  task: ApiTask;
  assignee: string;
  canComplete: boolean;
}) {
  const { toast } = useToast();
  const complete = useCompleteTask(task.id);

  return (
    <li className="flex items-start gap-3">
      <Checkbox
        id={`task-${task.id}`}
        checked={false}
        disabled={!canComplete || complete.isPending}
        onCheckedChange={() =>
          complete.mutate(undefined, {
            onSuccess: () => toast({ title: "Tarefa concluída", variant: "success" }),
            onError: (e) => toast({ title: messageForTaskError(e), variant: "error" }),
          })
        }
        className="mt-0.5"
        aria-label={`Concluir ${task.title}`}
      />
      <Link
        href={`/tasks/${task.id}`}
        className={cn("min-w-0 flex-1", complete.isPending && "opacity-60")}
      >
        <span className="block text-body2 font-medium text-ink hover:text-brand">{task.title}</span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="truncate text-caption text-ink-3">
            {assignee} · {formatTaskDate(task.dueAt)}
          </span>
          {/* taskPriorityMeta preserva URGENT, que o tipo Priority da UI não tem */}
          <Badge tone={taskPriorityMeta[task.priority].tone}>
            {taskPriorityMeta[task.priority].label}
          </Badge>
        </span>
      </Link>
    </li>
  );
}
