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

/* ---------- Origens de lead e atribuição (Sprint 1.5A-2) ---------- */

/**
 * Contrato REAL de origens e atribuição.
 *
 * Pontos que ditam a UI:
 * - o CATÁLOGO é da empresa (nome livre); `kind` é só agrupamento fixo;
 * - a atribuição é HISTÓRICO: nada é sobrescrito, e `firstTouch`/`lastTouch`
 *   vêm derivados do backend — o front não recalcula;
 * - UTMs/URLs/`capturedAt` são imutáveis: o PATCH só corrige o vínculo;
 * - não existe métrica de mídia aqui. `contactCount` é contagem de contatos
 *   distintos do CRM, não CPL/receita/ROAS.
 */
export const leadSourceKindSchema = z.enum([
  "INSTAGRAM",
  "FACEBOOK",
  "GOOGLE",
  "TIKTOK",
  "WHATSAPP",
  "EMAIL",
  "WEBSITE",
  "LANDING_PAGE",
  "FORM",
  "REFERRAL",
  "AFFILIATE",
  "ORGANIC",
  "DIRECT",
  "IMPORT",
  "OTHER",
]);
export type ApiLeadSourceKind = z.infer<typeof leadSourceKindSchema>;

export const leadSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: leadSourceKindSchema,
  description: z.string().nullable(),
  active: z.boolean(),
  position: z.number(),
  /** Origem padrão: não pode ser excluída, só desativada. */
  system: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiLeadSource = z.infer<typeof leadSourceSchema>;

/** Catálogo é pequeno e ordenado: sem paginação. */
export const leadSourceListSchema = z.object({ items: z.array(leadSourceSchema) });
export type ApiLeadSourceList = z.infer<typeof leadSourceListSchema>;

export interface LeadSourceFilters {
  active?: boolean;
  kind?: string;
}

export interface LeadSourceInput {
  name?: string;
  kind?: string;
  description?: string | null;
  active?: boolean;
  position?: number;
}

export const touchpointOriginSchema = z.enum(["MANUAL", "API"]);
export type ApiTouchpointOrigin = z.infer<typeof touchpointOriginSchema>;

/** Campanha resumida dentro da atribuição — sem métrica alguma. */
export const attributionCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: campaignStatusSchema,
  /** Arquivada/excluída DEPOIS da captura: o vínculo é preservado. */
  archived: z.boolean(),
  deleted: z.boolean(),
});
export type ApiAttributionCampaign = z.infer<typeof attributionCampaignSchema>;

export const attributionSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  leadSource: leadSourceSchema,
  campaign: attributionCampaignSchema.nullable(),
  medium: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmTerm: z.string().nullable(),
  utmContent: z.string().nullable(),
  referrerUrl: z.string().nullable(),
  landingUrl: z.string().nullable(),
  externalClickId: z.string().nullable(),
  touchpointOrigin: touchpointOriginSchema,
  capturedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiAttribution = z.infer<typeof attributionSchema>;

/** `firstTouch`/`lastTouch` vêm DERIVADOS do backend — não recalcular no front. */
export const contactAttributionsSchema = z.object({
  items: z.array(attributionSchema),
  firstTouch: attributionSchema.nullable(),
  lastTouch: attributionSchema.nullable(),
  total: z.number(),
});
export type ApiContactAttributions = z.infer<typeof contactAttributionsSchema>;

/** `contactCount` = contatos DISTINTOS. Não é métrica de mídia. */
export const campaignAttributionsSchema = z.object({
  items: z.array(attributionSchema),
  total: z.number(),
  contactCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type ApiCampaignAttributions = z.infer<typeof campaignAttributionsSchema>;

/** Corpo de POST. UTMs e datas só entram na CRIAÇÃO — depois são imutáveis. */
export interface AttributionInput {
  leadSourceId: string;
  campaignId?: string;
  medium?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrerUrl?: string;
  landingUrl?: string;
  externalClickId?: string;
  capturedAt?: string;
}

/** Corpo de PATCH: só o VÍNCULO. Enviar utm/capturedAt é 400 no BFF. */
export interface AttributionPatch {
  leadSourceId?: string;
  campaignId?: string | null;
  medium?: string | null;
}
