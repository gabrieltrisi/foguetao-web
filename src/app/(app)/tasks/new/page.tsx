import type { Metadata } from "next";
import { TaskForm } from "@/components/crm/task-form";

export const metadata: Metadata = {
  title: "Nova tarefa",
  description: "Cadastre uma nova tarefa.",
  robots: { index: false, follow: false },
};

export default function NewTaskPage() {
  return <TaskForm />;
}
