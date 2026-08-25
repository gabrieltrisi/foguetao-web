import type { Metadata } from "next";
import { TaskForm } from "@/components/crm/task-form";

export const metadata: Metadata = {
  title: "Editar tarefa",
  robots: { index: false, follow: false },
};

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskForm taskId={id} />;
}
