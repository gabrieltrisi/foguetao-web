import type { Task, TaskStatus } from "@/types/crm";
import type { Priority } from "@/types";

const ASSIGNEES = ["Camila Ribeiro", "Rafael Monteiro", "Bruno Alcântara", "Larissa Prado"];
const PRIORITIES: Priority[] = ["alta", "media", "baixa"];
const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

const RAW = [
  { title: "Enviar proposta para Vertex Farma", day: 13, related: "Vertex Farma" },
  { title: "Follow-up com Zenit Corp", day: 14, related: "Zenit Corp" },
  { title: "Revisar campanha Meta — Black Week", day: 15, related: "Núcleo Digital" },
  { title: "Ligar para Studio Ampère", day: 16, related: "Studio Ampère" },
  { title: "Preparar contrato Grão Café", day: 17, related: "Grão Café" },
  { title: "Onboarding Aurora Labs", day: 18, related: "Aurora Labs" },
  { title: "Atualizar pipeline do trimestre", day: 20, related: undefined },
  { title: "Reunião de qualificação Peça Rara", day: 21, related: "Peça Rara" },
  { title: "Enviar NPS para clientes ativos", day: 22, related: undefined },
  { title: "Revisar metas do time", day: 23, related: undefined },
  { title: "Demo do produto — Vinha & Co", day: 24, related: "Vinha & Co" },
  { title: "Fechar renovação Zenit Corp", day: 27, related: "Zenit Corp" },
  { title: "Organizar base de leads inbound", day: 10, related: undefined },
  { title: "Follow-up pós-evento", day: 9, related: undefined },
];

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const tasks: Task[] = RAW.map((t, i) => ({
  id: `task-${i + 1}`,
  title: t.title,
  description: "Detalhes da tarefa e próximos passos para avançar a oportunidade.",
  assignee: ASSIGNEES[i % ASSIGNEES.length],
  due: `2026-07-${String(t.day).padStart(2, "0")}`,
  dueLabel: `${t.day} ${MONTHS[6]} 2026`,
  priority: PRIORITIES[i % PRIORITIES.length],
  status: STATUSES[i % STATUSES.length],
  relatedTo: t.related,
}));

export const taskStatusColumns: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "A fazer" },
  { id: "doing", label: "Em andamento" },
  { id: "done", label: "Concluídas" },
];

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluída",
};

export const taskStatusTone: Record<TaskStatus, "neutral" | "info" | "success"> = {
  todo: "neutral",
  doing: "info",
  done: "success",
};

export function tasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

/** Mês de referência do calendário visual (julho/2026). */
export const calendarMonth = { year: 2026, month: 6 };
