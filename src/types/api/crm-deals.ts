import { z } from "zod";
import { paginated } from "./crm";

/* ---------- Enums (backend) ---------- */
export const stageCategorySchema = z.enum(["OPEN", "WON", "LOST"]);
export type StageCategory = z.infer<typeof stageCategorySchema>;

export const pipelineSetupModeSchema = z.enum(["STANDARD", "CUSTOM", "EMPTY"]);
export type PipelineSetupMode = z.infer<typeof pipelineSetupModeSchema>;

/** Requisitos que o backend reporta como faltantes em um pipeline incompleto. */
export const missingRequirementSchema = z.enum(["OPEN_STAGE", "WON_STAGE", "LOST_STAGE"]);
export type MissingRequirement = z.infer<typeof missingRequirementSchema>;

/* ---------- Pipeline (GET /pipelines e /pipelines/:id → modelo cru) ---------- */
export const pipelineSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isDefault: z.boolean(),
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();
export type ApiPipeline = z.infer<typeof pipelineSchema>;
export const pipelineListSchema = paginated(pipelineSchema);

/* ---------- Stage ---------- */
/** Etapa completa (GET /pipelines/:id/stages → modelo cru). */
export const stageSchema = z
  .object({
    id: z.string(),
    pipelineId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string().nullable(),
    position: z.number(),
    probability: z.number().nullable(),
    category: stageCategorySchema,
    active: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();
export type ApiStage = z.infer<typeof stageSchema>;
export const stageListSchema = z.array(stageSchema);

/** Etapa resumida devolvida dentro de PipelineSetupResponseDto. */
export const pipelineStageViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  position: z.number(),
  probability: z.number().nullable(),
  category: stageCategorySchema,
  active: z.boolean(),
});
export type ApiPipelineStageView = z.infer<typeof pipelineStageViewSchema>;

/** Resposta de POST /pipelines e POST /pipelines/:id/setup. */
export const pipelineSetupResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  setupMode: pipelineSetupModeSchema,
  setupComplete: z.boolean(),
  missingRequirements: z.array(z.string()),
  stages: z.array(pipelineStageViewSchema),
});
export type ApiPipelineSetup = z.infer<typeof pipelineSetupResponseSchema>;

/** Entrada de etapa para setup CUSTOM. */
export interface CustomStageInput {
  name: string;
  category: StageCategory;
  probability?: number;
  color?: string;
  position?: number;
}

/* ---------- Deals ---------- */
export const dealStatusSchema = z.enum(["OPEN", "WON", "LOST", "ARCHIVED"]);
export type DealStatus = z.infer<typeof dealStatusSchema>;

export const dealPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type DealPriority = z.infer<typeof dealPrioritySchema>;

export const dealActivityTypeSchema = z.enum([
  "CREATED",
  "UPDATED",
  "STAGE_CHANGED",
  "ASSIGNED",
  "VALUE_CHANGED",
  "CONTACT_LINKED",
  "CONTACT_UNLINKED",
  "ORGANIZATION_LINKED",
  "ORGANIZATION_UNLINKED",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "WON",
  "LOST",
  "REOPENED",
  "ARCHIVED",
  "RESTORED",
]);
export type DealActivityType = z.infer<typeof dealActivityTypeSchema>;

/**
 * DealResponseDto. `value` e `weightedValue` são STRING decimal e permanecem
 * string em toda a aplicação (formatação só na apresentação).
 */
export const dealSchema = z.object({
  id: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),
  contactId: z.string().nullable(),
  organizationId: z.string().nullable(),
  assignedToUserId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  value: z.string(),
  currency: z.string(),
  weightedValue: z.string(),
  status: dealStatusSchema,
  priority: dealPrioritySchema,
  source: z.string().nullable(),
  expectedCloseDate: z.string().nullable(),
  wonAt: z.string().nullable(),
  lostAt: z.string().nullable(),
  lostReasonId: z.string().nullable(),
  lostReasonText: z.string().nullable(),
  version: z.number(),
  lastStageChangedAt: z.string(),
  lastActivityAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiDeal = z.infer<typeof dealSchema>;
export const dealListSchema = paginated(dealSchema);

/** DealStageHistory (modelo cru; array não paginado). */
export const dealHistorySchema = z
  .object({
    id: z.string(),
    dealId: z.string(),
    pipelineId: z.string(),
    fromStageId: z.string().nullable(),
    toStageId: z.string(),
    movedByUserId: z.string(),
    reason: z.string().nullable(),
    enteredAt: z.string(),
    leftAt: z.string().nullable(),
    durationSeconds: z.number().nullable(),
    createdAt: z.string(),
  })
  .passthrough();
export type ApiDealHistory = z.infer<typeof dealHistorySchema>;
export const dealHistoryListSchema = z.array(dealHistorySchema);

/** DealActivity (modelo cru; paginado). */
export const dealActivitySchema = z
  .object({
    id: z.string(),
    dealId: z.string(),
    userId: z.string().nullable(),
    type: dealActivityTypeSchema,
    title: z.string(),
    description: z.string().nullable(),
    metadata: z.unknown().nullable().optional(),
    occurredAt: z.string(),
    createdAt: z.string(),
  })
  .passthrough();
export type ApiDealActivity = z.infer<typeof dealActivitySchema>;
export const dealActivityListSchema = paginated(dealActivitySchema);

/** LostReason (modelo cru; array não paginado). */
export const lostReasonSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    active: z.boolean(),
    position: z.number(),
  })
  .passthrough();
export type ApiLostReason = z.infer<typeof lostReasonSchema>;
export const lostReasonListSchema = z.array(lostReasonSchema);

/* ---------- Kanban ---------- */
/** Totais por MOEDA de uma coluna (o backend agrupa por currency). */
export const kanbanTotalSchema = z.object({
  currency: z.string(),
  count: z.number(),
  totalValue: z.string(),
  weightedValue: z.string(),
});
export type ApiKanbanTotal = z.infer<typeof kanbanTotalSchema>;

/** Coluna do board — também é a resposta de "carregar mais" da coluna. */
export const kanbanColumnSchema = z.object({
  stageId: z.string(),
  name: z.string(),
  category: stageCategorySchema,
  position: z.number(),
  probability: z.number().nullable(),
  deals: z.array(dealSchema),
  nextCursor: z.string().nullable(),
  totals: z.array(kanbanTotalSchema),
});
export type ApiKanbanColumn = z.infer<typeof kanbanColumnSchema>;

export const kanbanBoardSchema = z.object({
  pipelineId: z.string(),
  columns: z.array(kanbanColumnSchema),
});
export type ApiKanbanBoard = z.infer<typeof kanbanBoardSchema>;
