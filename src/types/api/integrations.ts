import { z } from "zod";
import { paginated } from "./crm";

/* ---------- Enums reais do backend ---------- */

/** IntegrationProvider (Prisma). Só estes podem ter conexão. */
export const integrationProviderSchema = z.enum([
  "WHATSAPP_CLOUD",
  "EVOLUTION",
  "META_ADS",
  "GOOGLE_ADS",
  "SMTP",
  "SENDGRID",
  "AMAZON_SES",
  "S3",
  "CLOUDFLARE_R2",
  "STRIPE",
  "CUSTOM_WEBHOOK",
  "MOCK",
]);
export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;

/** IntegrationCategory (Prisma) — a categoria persistida na conexão. */
export const integrationCategorySchema = z.enum([
  "MESSAGING",
  "ADVERTISING",
  "EMAIL",
  "STORAGE",
  "PAYMENT",
  "AUTOMATION",
  "CUSTOM",
]);
export type IntegrationCategory = z.infer<typeof integrationCategorySchema>;

/**
 * Status da CONEXÃO da empresa. Não confundir com a disponibilidade da
 * integração no produto (`availability`) — são conceitos distintos e a UI
 * nunca os mistura. O backend não tem `PAUSED`: pausar = DISCONNECTED.
 */
export const integrationStatusSchema = z.enum([
  "DRAFT",
  "CONNECTING",
  "CONNECTED",
  "DEGRADED",
  "ERROR",
  "DISCONNECTED",
  "REVOKED",
]);
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;

export const integrationEnvironmentSchema = z.enum(["SANDBOX", "PRODUCTION"]);
export type IntegrationEnvironment = z.infer<typeof integrationEnvironmentSchema>;

/** Disponibilidade da integração no PRODUTO (independe da empresa). */
export const availabilitySchema = z.enum(["AVAILABLE", "COMING_SOON", "DISABLED"]);
export type Availability = z.infer<typeof availabilitySchema>;

/** Agrupamento de exibição do catálogo (superconjunto de IntegrationCategory). */
export const catalogCategorySchema = z.enum([
  "MESSAGING",
  "ADVERTISING",
  "ANALYTICS",
  "AUTOMATION",
  "PRODUCTIVITY",
  "STORAGE",
  "WEBHOOKS",
  "CUSTOM",
]);
export type CatalogCategory = z.infer<typeof catalogCategorySchema>;

export const catalogAuthModeSchema = z.enum([
  "NONE",
  "API_KEY",
  "OAUTH2",
  "CUSTOM_CREDENTIALS",
  "SIGNED_WEBHOOK",
]);
export type CatalogAuthMode = z.infer<typeof catalogAuthModeSchema>;

export const credentialTypeSchema = z.enum([
  "API_KEY",
  "ACCESS_TOKEN",
  "REFRESH_TOKEN",
  "CLIENT_SECRET",
  "WEBHOOK_SECRET",
  "PRIVATE_KEY",
  "USERNAME",
  "PASSWORD",
  "CUSTOM",
]);
export type CredentialType = z.infer<typeof credentialTypeSchema>;

/** Capabilities genéricas declaradas pelo adapter. */
export const capabilitySchema = z.enum([
  "CONNECTION_TEST",
  "CONNECT",
  "DISCONNECT",
  "HEALTH_CHECK",
  "WEBHOOK_RECEIVE",
  "WEBHOOK_VERIFY",
  "SYNC_FULL",
  "SYNC_INCREMENTAL",
  "OUTBOUND_EXECUTE",
  "OAUTH",
  "CREDENTIAL_REFRESH",
]);
export type Capability = z.infer<typeof capabilitySchema>;

/* ---------- Catálogo ---------- */

export const catalogItemSchema = z.object({
  key: z.string(),
  provider: integrationProviderSchema.nullable(),
  connectionCategory: integrationCategorySchema.nullable(),
  name: z.string(),
  description: z.string(),
  category: catalogCategorySchema,
  icon: z.string(),
  authMode: catalogAuthModeSchema,
  docsSummary: z.string(),
  limitations: z.string(),
  availability: availabilitySchema,
  implemented: z.boolean(),
  mock: z.boolean(),
  connectable: z.boolean(),
  capabilities: z.array(capabilitySchema),
  order: z.number(),
});
export type ApiCatalogItem = z.infer<typeof catalogItemSchema>;

export const catalogSchema = z.object({
  items: z.array(catalogItemSchema),
  enabled: z.boolean(),
  mode: z.enum(["mock", "real"]),
  total: z.number().optional(),
});
export type ApiCatalog = z.infer<typeof catalogSchema>;

/* ---------- Conexão ---------- */

/**
 * Resumo de credenciais: contagens e tipos, NUNCA o valor. É o único sinal de
 * credencial que a API expõe — não existe endpoint que devolva o segredo.
 */
export const credentialsSummarySchema = z.object({
  total: z.number(),
  types: z.array(credentialTypeSchema),
  expired: z.number(),
  revoked: z.number(),
});
export type ApiCredentialsSummary = z.infer<typeof credentialsSummarySchema>;

export const integrationConnectionSchema = z.object({
  id: z.string(),
  provider: integrationProviderSchema,
  category: integrationCategorySchema,
  name: z.string(),
  status: integrationStatusSchema,
  environment: integrationEnvironmentSchema,
  /** Config pública validada por provider. O backend rejeita segredo aqui. */
  config: z.record(z.string(), z.unknown()),
  implemented: z.boolean(),
  capabilities: z.array(capabilitySchema),
  externalAccountId: z.string().nullable(),
  externalAccountName: z.string().nullable(),
  lastConnectedAt: z.string().nullable(),
  lastSuccessfulAt: z.string().nullable(),
  lastFailureAt: z.string().nullable(),
  lastErrorCode: z.string().nullable(),
  lastErrorMessageSanitized: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  credentialsSummary: credentialsSummarySchema.optional(),
});
export type ApiIntegrationConnection = z.infer<typeof integrationConnectionSchema>;
export const integrationConnectionListSchema = paginated(integrationConnectionSchema);

/** Resultado de POST /integrations/:id/test (só o MOCK executa de fato). */
export const connectionTestResultSchema = z.object({
  success: z.boolean(),
  externalAccountId: z.string().nullable(),
  externalAccountName: z.string().nullable(),
  latencyMs: z.number().optional(),
  capabilities: z.array(capabilitySchema).optional(),
});
export type ApiConnectionTestResult = z.infer<typeof connectionTestResultSchema>;

/**
 * Resultado de connect/disconnect. ATENÇÃO: o backend NÃO devolve a conexão
 * inteira aqui, só o resultado da operação — por isso os hooks invalidam o
 * detalhe em vez de escrever a resposta no cache.
 */
export const connectionOperationResultSchema = z.object({
  success: z.boolean(),
  status: integrationStatusSchema,
  externalAccountId: z.string().nullable().optional(),
  externalAccountName: z.string().nullable().optional(),
});
export type ApiConnectionOperationResult = z.infer<typeof connectionOperationResultSchema>;

/** DELETE /integrations/:id → mensagem do backend, propagada como veio. */
export const messageResultSchema = z.object({ message: z.string() });

/* ---------- Logs ---------- */

/** IntegrationRequestStatus (Prisma). */
export const integrationLogStatusSchema = z.enum([
  "SUCCESS",
  "FAILURE",
  "TIMEOUT",
  "RATE_LIMITED",
  "CIRCUIT_OPEN",
]);
export type IntegrationLogStatus = z.infer<typeof integrationLogStatusSchema>;

export const integrationLogSchema = z.object({
  id: z.string(),
  provider: integrationProviderSchema,
  operation: z.string(),
  status: integrationLogStatusSchema,
  httpStatus: z.number().nullable(),
  durationMs: z.number().nullable(),
  attempt: z.number(),
  errorCode: z.string().nullable(),
  errorMessageSanitized: z.string().nullable(),
  createdAt: z.string(),
});
export type ApiIntegrationLog = z.infer<typeof integrationLogSchema>;
export const integrationLogListSchema = paginated(integrationLogSchema);

/* ---------- Inputs ---------- */

/** POST /integrations. `config` é pública; segredo vai por outro endpoint. */
export interface CreateConnectionInput {
  provider: IntegrationProvider;
  category: IntegrationCategory;
  name: string;
  environment?: IntegrationEnvironment;
  config?: Record<string, unknown>;
}

/** PATCH /integrations/:id — provider e category são IMUTÁVEIS no backend. */
export interface UpdateConnectionInput {
  name?: string;
  config?: Record<string, unknown>;
  environment?: IntegrationEnvironment;
}

export interface CatalogFilters {
  category?: CatalogCategory;
  availability?: Availability;
  search?: string;
}

export interface ConnectionFilters {
  page?: number;
  limit?: number;
  search?: string;
  provider?: IntegrationProvider;
  category?: IntegrationCategory;
  status?: IntegrationStatus;
  environment?: IntegrationEnvironment;
  sortBy?: "name" | "createdAt" | "updatedAt" | "lastSuccessfulAt" | "lastFailureAt";
  sortOrder?: "asc" | "desc";
}

export interface LogFilters {
  page?: number;
  limit?: number;
  status?: IntegrationLogStatus;
  operation?: string;
  sortOrder?: "asc" | "desc";
}
