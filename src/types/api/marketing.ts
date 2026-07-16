import { z } from "zod";

/**
 * Contrato REAL de Campanhas (Sprint 1.5A-1).
 *
 * Pontos que ditam a UI:
 * - `budget` é STRING decimal (ou null) — nunca float.
 * - O contrato NÃO tem métrica de mídia (spent/leads/CPL/ROAS/…): esses dados
 *   pertencem a providers externos e ao domínio de Performance. Nada disso é
 *   exibido nem calculado aqui.
 * - `status` só muda pelas AÇÕES (activate/pause/complete/cancel/archive/
 *   restore); o PATCH não aceita status.
 * - Arquivada é somente leitura até restaurar; restaurar volta para DRAFT.
 */

export const campaignStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELED",
  "ARCHIVED",
]);
export type ApiCampaignStatus = z.infer<typeof campaignStatusSchema>;

export const campaignChannelSchema = z.enum([
  "INTERNAL",
  "META_ADS",
  "GOOGLE_ADS",
  "TIKTOK_ADS",
  "WHATSAPP",
  "EMAIL",
  "SMS",
  "LANDING_PAGE",
  "AFFILIATE",
  "ORGANIC",
  "OTHER",
]);
export type ApiCampaignChannel = z.infer<typeof campaignChannelSchema>;

export const campaignObjectiveSchema = z.enum([
  "LEAD_GENERATION",
  "SALES",
  "TRAFFIC",
  "ENGAGEMENT",
  "AWARENESS",
  "RETENTION",
  "REACTIVATION",
  "CUSTOM",
]);
export type ApiCampaignObjective = z.infer<typeof campaignObjectiveSchema>;

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: campaignStatusSchema,
  channel: campaignChannelSchema,
  objective: campaignObjectiveSchema,
  /** String decimal ("1500.00") ou null — jamais number. */
  budget: z.string().nullable(),
  currency: z.string(),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  ownerUserId: z.string().nullable(),
  pipelineId: z.string().nullable(),
  externalProvider: z.string().nullable(),
  externalId: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiCampaign = z.infer<typeof campaignSchema>;

/** Envelope paginado por offset (padrão do CRM). */
export const campaignListSchema = z.object({
  items: z.array(campaignSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type ApiCampaignList = z.infer<typeof campaignListSchema>;

/** Filtros reais de GET /campaigns. */
export interface CampaignFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
  objective?: string;
  ownerUserId?: string;
  pipelineId?: string;
  startFrom?: string;
  endTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Corpo de POST/PATCH — `budget` como string decimal. */
export interface CampaignInput {
  name?: string;
  description?: string | null;
  channel?: string;
  objective?: string;
  budget?: string | null;
  currency?: string;
  startAt?: string | null;
  endAt?: string | null;
  ownerUserId?: string | null;
  pipelineId?: string | null;
  externalProvider?: string | null;
  externalId?: string | null;
}

/** As 6 ações reais de status. */
export const campaignActions = [
  "activate",
  "pause",
  "complete",
  "cancel",
  "archive",
  "restore",
] as const;
export type CampaignAction = (typeof campaignActions)[number];
