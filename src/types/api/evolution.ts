import { z } from "zod";
import {
  integrationEnvironmentSchema,
  integrationProviderSchema,
  integrationStatusSchema,
  type IntegrationEnvironment,
} from "./integrations";

/**
 * Contratos PÚBLICOS da superfície de onboarding Evolution (Sprint 7.1A/B/C).
 * Reutiliza os enums de integrations (sem duplicar). NUNCA representa segredos:
 * API key, webhook secret e credenciais não existem nestes shapes por design.
 */

/* ---------- Capabilities ---------- */

export const evolutionCapabilitiesSchema = z.object({
  provider: z.literal("EVOLUTION"),
  onboarding: z.object({
    provision: z.boolean(),
    qr: z.boolean(),
    disconnect: z.boolean(),
    webhookConfiguration: z.boolean(),
  }),
  messaging: z.object({
    text: z.boolean(),
    image: z.boolean(),
    document: z.boolean(),
    audio: z.boolean(),
  }),
  features: z.object({
    groups: z.boolean(),
    broadcast: z.boolean(),
    templates: z.boolean(),
  }),
  environments: z.object({ sandbox: z.boolean(), production: z.boolean() }),
});
export type ApiEvolutionCapabilities = z.infer<typeof evolutionCapabilitiesSchema>;

/* ---------- Conexão (DTO público) ---------- */

export const evolutionSendabilityReasonSchema = z.object({
  code: z.string(),
  retryable: z.boolean(),
  connectionStatus: integrationStatusSchema,
});
export type ApiEvolutionSendabilityReason = z.infer<typeof evolutionSendabilityReasonSchema>;

export const evolutionConnectionSchema = z.object({
  connectionId: z.string(),
  provider: integrationProviderSchema,
  environment: integrationEnvironmentSchema,
  displayName: z.string(),
  status: integrationStatusSchema,
  canSend: z.boolean(),
  sendabilityReason: evolutionSendabilityReasonSchema.nullable(),
  instanceName: z.string().nullable(),
  webhookConfigured: z.boolean(),
  qrAvailable: z.boolean(),
  lastConnectedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiEvolutionConnection = z.infer<typeof evolutionConnectionSchema>;

/* ---------- QR (polling) ---------- */

export const evolutionQrReasonSchema = z.enum([
  "QR_NOT_READY",
  "QR_EXPIRED",
  "ALREADY_CONNECTED",
  "CONNECTION_NOT_READY",
]);
export type ApiEvolutionQrReason = z.infer<typeof evolutionQrReasonSchema>;

export const evolutionQrSchema = z.object({
  available: z.boolean(),
  reason: evolutionQrReasonSchema.optional(),
  expiresAt: z.string().optional(),
  qr: z
    .object({ format: z.enum(["data-url", "code", "pairing"]), value: z.string() })
    .optional(),
});
export type ApiEvolutionQr = z.infer<typeof evolutionQrSchema>;

/* ---------- Webhook (estado público) ---------- */

export const evolutionWebhookStateSchema = z.object({
  configured: z.boolean(),
  endpointPublicId: z.string().nullable(),
  events: z.array(z.string()),
});
export type ApiEvolutionWebhookState = z.infer<typeof evolutionWebhookStateSchema>;

/* ---------- Entrada de criação (write-only; apiKey nunca retorna) ---------- */

export interface CreateEvolutionConnectionInput {
  name: string;
  baseUrl: string;
  apiKey: string;
  environment?: IntegrationEnvironment;
}
