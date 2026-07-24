import { z } from "zod";

/**
 * Contratos das Campanhas de WhatsApp (Sprint C1). Espelham o backend
 * `messaging/campaigns`. Público (audienceSpec) e conteúdo (message) são write/
 * read conforme o endpoint; nada de provider aqui.
 */

export const campaignStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PREPARING",
  "SENDING",
  "PAUSED",
  "COMPLETED",
  "COMPLETED_WITH_ERRORS",
  "CANCELED",
]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const audienceKindSchema = z.enum(["ALL", "TAGS", "CONTACTS"]);
export type AudienceKind = z.infer<typeof audienceKindSchema>;

export const audienceSpecSchema = z.union([
  z.object({ kind: z.literal("ALL") }),
  z.object({ kind: z.literal("TAGS"), tagIds: z.array(z.string()) }),
  z.object({ kind: z.literal("CONTACTS"), contactIds: z.array(z.string()) }),
]);
export type AudienceSpec = z.infer<typeof audienceSpecSchema>;

export const campaignCountersSchema = z.object({
  total: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  sent: z.number(),
  delivered: z.number(),
  read: z.number(),
  failed: z.number(),
  canceled: z.number(),
});
export type CampaignCounters = z.infer<typeof campaignCountersSchema>;

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: campaignStatusSchema,
  messagingAccountId: z.string().nullable(),
  audience: audienceSpecSchema.nullable(),
  /** Presente só no DETALHE (autorizado). */
  message: z.string().nullable().optional(),
  messagePreview: z.string().nullable(),
  timezone: z.string(),
  scheduledAt: z.string().nullable(),
  counters: campaignCountersSchema,
  createdByUserId: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  pausedAt: z.string().nullable(),
  canceledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiCampaign = z.infer<typeof campaignSchema>;

export const campaignListSchema = z.object({
  items: z.array(campaignSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type ApiCampaignList = z.infer<typeof campaignListSchema>;

const exclusionReasonSchema = z.enum([
  "NO_PHONE",
  "INVALID_PHONE",
  "OPT_OUT",
  "SUPPRESSED",
  "DUPLICATE",
  "SELF",
  "NOT_IN_ALLOWLIST",
]);
export const audiencePreviewSchema = z.object({
  total: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  byReason: z.record(exclusionReasonSchema, z.number()),
});
export type ApiAudiencePreview = z.infer<typeof audiencePreviewSchema>;

/* ---------- inputs ---------- */

export interface CreateCampaignInput {
  name: string;
  description?: string;
  messagingAccountId?: string;
  audience?: AudienceSpec;
  message?: string;
  timezone?: string;
  sendAt?: string;
}
export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: CampaignStatus[];
  messagingAccountId?: string;
  createdByUserId?: string;
  search?: string;
  sortBy?: "scheduledAt" | "updatedAt" | "createdAt" | "name";
  sortDir?: "asc" | "desc";
}
