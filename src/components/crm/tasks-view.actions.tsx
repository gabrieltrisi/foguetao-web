"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/hooks/company/use-permissions";

/** Botão "Nova tarefa" visível apenas com permissão crm.tasks.create. */
export function NewTaskAction() {
  return (
    <Can permission="crm.tasks.create">
      <Button asChild size="sm">
        <Link href="/tasks/new">
          <Plus />
          Nova tarefa
        </Link>
      </Button>
    </Can>
  );
}
