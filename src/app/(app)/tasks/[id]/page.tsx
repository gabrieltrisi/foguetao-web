import type { Metadata } from "next";
import { TaskDetail } from "@/components/crm/task-detail";

export const metadata: Metadata = {
  title: "Tarefa",
  description: "Detalhes da tarefa.",
  robots: { index: false, follow: false },
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
