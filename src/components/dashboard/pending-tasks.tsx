"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/ui/status-badge";
import { pendingTasks } from "@/mocks/dashboard";

export function PendingTasks() {
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Tarefas pendentes"
        action={<span className="text-body2 font-medium text-brand">Ver todas</span>}
      />
      <ul className="mt-4 flex flex-col gap-3">
        {pendingTasks.map((task) => {
          const checked = done[task.id] ?? task.done;
          return (
            <li key={task.id} className="flex items-start gap-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={checked}
                onCheckedChange={(value) =>
                  setDone((prev) => ({ ...prev, [task.id]: value === true }))
                }
                className="mt-0.5"
                aria-label={task.title}
              />
              <label htmlFor={`task-${task.id}`} className="min-w-0 flex-1 cursor-pointer">
                <span
                  className={cn(
                    "block text-body2 font-medium text-ink",
                    checked && "text-ink-3 line-through",
                  )}
                >
                  {task.title}
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className="text-caption text-ink-3">
                    {task.owner} · {task.due}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
