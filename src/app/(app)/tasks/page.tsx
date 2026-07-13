import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { TasksView } from "@/components/crm/tasks-view";
import { NewTaskButton } from "@/components/crm/new-task-button";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Acompanhe as tarefas do seu time.",
};

export default function TasksPage() {
  return (
    <ListPageLayout
      title="Tarefas"
      description="Acompanhe as tarefas pendentes do seu time."
      actions={<NewTaskButton />}
    >
      <TasksView />
    </ListPageLayout>
  );
}
