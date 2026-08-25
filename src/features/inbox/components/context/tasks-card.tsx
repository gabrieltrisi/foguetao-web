"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/providers/session-provider";
import { useTasks, useCompleteTask } from "@/hooks/crm/use-tasks";
import { formatDate } from "@/lib/crm/display";
import type { ApiTask } from "@/types/api/crm-tasks";
import { PanelSection } from "./panel-section";

const PRIORITY_TONE: Record<string, "neutral" | "info" | "warning" | "danger"> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
};

/** Uma tarefa (componente próprio → `useCompleteTask` por item, sem violar hooks). */
function TaskItem({ task, canComplete }: { task: ApiTask; canComplete: boolean }) {
  const { toast } = useToast();
  const complete = useCompleteTask(task.id);
  const done = task.status === "COMPLETED";
  return (
    <li className="flex items-start gap-2">
      {canComplete && !done ? (
        <button
          type="button"
          aria-label={`Concluir tarefa ${task.title}`}
          disabled={complete.isPending}
          onClick={() =>
            complete.mutate(undefined, {
              onError: () => toast({ title: "Não foi possível concluir.", variant: "error" }),
            })
          }
          className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-line hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      ) : (
        <span
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${done ? "border-success bg-success text-white" : "border-line"}`}
          aria-hidden
        >
          {done ? <Check className="size-3" /> : null}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-caption ${done ? "text-ink-3 line-through" : "text-ink"}`}>{task.title}</p>
        <div className="flex items-center gap-1.5 text-micro text-ink-3">
          {task.dueAt ? <span>{formatDate(task.dueAt)}</span> : null}
          <Badge tone={PRIORITY_TONE[task.priority] ?? "neutral"}>{task.priority}</Badge>
        </div>
      </div>
    </li>
  );
}

/**
 * Card TAREFAS (F6). `useTasks({contactId})` (filtro 1ª classe). Pendentes/concluídas,
 * data, prioridade. Concluir via `useCompleteTask` (gated `crm.tasks.complete`).
 */
export function TasksCard({ contactId }: { contactId: string }) {
  const { can } = useSession();
  const denied = !can("crm.tasks.read");
  const canComplete = can("crm.tasks.complete");
  const q = useTasks({ contactId });
  const tasks = q.data?.items ?? [];

  return (
    <PanelSection
      title="Tarefas"
      denied={denied}
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={!q.isLoading && !q.isError && tasks.length === 0}
      emptyLabel="Sem tarefas."
      onRetry={() => void q.refetch()}
    >
      <ul className="space-y-1.5">
        {tasks.slice(0, 8).map((t) => (
          <TaskItem key={t.id} task={t} canComplete={canComplete} />
        ))}
      </ul>
    </PanelSection>
  );
}
