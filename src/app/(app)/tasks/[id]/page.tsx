import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskDetail } from "@/components/crm/task-detail";
import { tasks, getTaskById } from "@/mocks/crm/tasks";

export function generateStaticParams() {
  return tasks.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = getTaskById(id);
  return { title: task ? task.title : "Tarefa" };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) notFound();
  return <TaskDetail task={task} />;
}
