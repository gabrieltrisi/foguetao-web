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

export const exclusionReasonSchema = z.enum([
  "NO_PHONE",
  "INVALID_PHONE",
  "OPT_OUT",
  "SUPPRESSED",
  "DUPLICATE",
  "SELF",
  "NOT_IN_ALLOWLIST",
]);
export type ExclusionReason = z.infer<typeof exclusionReasonSchema>;

export const audiencePreviewSchema = z.object({
  total: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  byReason: z.record(exclusionReasonSchema, z.number()),
});
export type ApiAudiencePreview = z.infer<typeof audiencePreviewSchema>;

/* ---------- Execução (Sprint C2B) — espelham os DTOs reais do backend ---------- */

/** Status de destinatário (enum real CampaignRecipientStatus). */
export const recipientStatusSchema = z.enum([
  "PENDING",
  "EXCLUDED",
  "QUEUED",
  "SENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
  "CANCELED",
]);
export type RecipientStatus = z.infer<typeof recipientStatusSchema>;

/** GET /messaging/campaigns/:id/metrics — CampaignMetricsDto. */
export const campaignMetricsSchema = z.object({
  totalSnapshot: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  pending: z.number(),
  queued: z.number(),
  sent: z.number(),
  delivered: z.number(),
  read: z.number(),
  failed: z.number(),
  canceled: z.number(),
  processed: z.number(),
  progressPercentage: z.number(),
  deliveryRate: z.number(),
  readRate: z.number(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  estimatedCompletionAt: z.string().nullable(),
  remainingSeconds: z.number().nullable(),
});
export type ApiCampaignMetrics = z.infer<typeof campaignMetricsSchema>;

/** GET /messaging/campaigns/:id/recipients — linha (sem conteúdo cifrado). */
export const campaignRecipientSchema = z.object({
  id: z.string(),
  contactId: z.string().nullable(),
  name: z.string().nullable(),
  phone: z.string(),
  status: recipientStatusSchema,
  exclusionReason: exclusionReasonSchema.nullable(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  readAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  attempts: z.number(),
  errorCode: z.string().nullable(),
});
export type ApiCampaignRecipient = z.infer<typeof campaignRecipientSchema>;

export const campaignRecipientListSchema = z.object({
  items: z.array(campaignRecipientSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type ApiCampaignRecipientList = z.infer<typeof campaignRecipientListSchema>;

/** GET /messaging/campaigns/:id/timeline — evento de lifecycle (via AuditLog). */
export const campaignTimelineEventSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  actorUserId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});
export type ApiCampaignTimelineEvent = z.infer<typeof campaignTimelineEventSchema>;
export const campaignTimelineSchema = z.array(campaignTimelineEventSchema);

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

export interface RecipientFilters {
  page?: number;
  limit?: number;
  status?: RecipientStatus;
  exclusionReason?: ExclusionReason;
  search?: string;
  sortBy?: "createdAt" | "status" | "sentAt" | "deliveredAt";
  sortDir?: "asc" | "desc";
}
