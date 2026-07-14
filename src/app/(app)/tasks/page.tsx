import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { TasksView } from "@/components/crm/tasks-view";
import { NewTaskAction } from "@/components/crm/tasks-view.actions";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Acompanhe as tarefas do seu time.",
  robots: { index: false, follow: false },
};

export default function TasksPage() {
  return (
    <ListPageLayout
      title="Tarefas"
      description="Acompanhe as tarefas pendentes do seu time."
      actions={<NewTaskAction />}
    >
      <TasksView />
    </ListPageLayout>
  );
}
