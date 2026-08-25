import { z } from "zod";
import { paginated } from "./crm";

/* ---------- Enums (backend: TaskStatus / TaskPriority) ---------- */
export const taskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

/** Status aceitos na CRIAÇÃO (CreateTaskDto.CREATABLE_STATUS). */
export const creatableTaskStatus = ["PENDING", "IN_PROGRESS"] as const satisfies readonly TaskStatus[];
/** Status aceitos no PATCH (UpdateTaskDto.PATCHABLE_STATUS — COMPLETED tem endpoint próprio). */
export const patchableTaskStatus = [
  "PENDING",
  "IN_PROGRESS",
  "CANCELED",
] as const satisfies readonly TaskStatus[];

/** Allowlist real de ordenação (ListTasksQueryDto.SORT). */
export const taskSortFields = [
  "createdAt",
  "updatedAt",
  "dueAt",
  "priority",
  "status",
] as const;
export type TaskSortField = (typeof taskSortFields)[number];

/**
 * TaskResponseDto. Atenção: `assignedToUserId` NÃO é nulável — toda tarefa
 * tem responsável (o backend exige no create e só troca via /assign).
 */
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assignedToUserId: z.string(),
  dealId: z.string().nullable(),
  contactId: z.string().nullable(),
  organizationId: z.string().nullable(),
  dueAt: z.string().nullable(),
  reminderAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  completedByUserId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiTask = z.infer<typeof taskSchema>;
export const taskListSchema = paginated(taskSchema);

/** Corpo de POST /tasks (assignedToUserId é OBRIGATÓRIO). */
export interface CreateTaskInput {
  title: string;
  assignedToUserId: string;
  description?: string;
  status?: (typeof creatableTaskStatus)[number];
  priority?: TaskPriority;
  dueAt?: string;
  reminderAt?: string;
  dealId?: string;
  contactId?: string;
  organizationId?: string;
}

/** Corpo de PATCH /tasks/:id — NÃO aceita assignedToUserId (use /assign). */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: (typeof patchableTaskStatus)[number];
  priority?: TaskPriority;
  dueAt?: string | null;
  reminderAt?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  organizationId?: string | null;
}

/** Filtros reais de GET /tasks. */
export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToUserId?: string;
  dealId?: string;
  contactId?: string;
  organizationId?: string;
  overdue?: boolean;
  dueFrom?: string;
  dueTo?: string;
  sortBy?: TaskSortField;
  sortOrder?: "asc" | "desc";
}
