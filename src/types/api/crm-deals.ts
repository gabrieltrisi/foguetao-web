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
