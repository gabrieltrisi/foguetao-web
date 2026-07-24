/**
 * Helpers de permissão (puros e isomórficos — sem dependências de server).
 * A lista de permissões vem do backend em GET /companies/:id/context.
 */

/** Verdadeiro se a lista contém a permissão exata. */
export function can(permissions: readonly string[], permission: string): boolean {
  return permissions.includes(permission);
}

/** Verdadeiro se a lista contém PELO MENOS UMA das permissões. */
export function canAny(permissions: readonly string[], required: readonly string[]): boolean {
  if (required.length === 0) return true;
  return required.some((p) => permissions.includes(p));
}

/** Verdadeiro se a lista contém TODAS as permissões. */
export function canAll(permissions: readonly string[], required: readonly string[]): boolean {
  return required.every((p) => permissions.includes(p));
}

/** Catálogo parcial de permissões usadas pelo frontend (fonte: backend PERMISSIONS). */
export const PERMISSIONS = {
  COMPANY_READ: "company.read",
  COMPANY_UPDATE: "company.update",
  COMPANY_DELETE: "company.delete",
  COMPANY_MEMBERS_READ: "company.members.read",
  COMPANY_MEMBERS_INVITE: "company.members.invite",
  COMPANY_MEMBERS_UPDATE: "company.members.update",
  COMPANY_MEMBERS_REMOVE: "company.members.remove",
  COMPANY_SETTINGS_READ: "company.settings.read",
  COMPANY_SETTINGS_UPDATE: "company.settings.update",
  COMPANY_AUDIT_READ: "company.audit.read",
  COMPANY_ROLES_READ: "company.roles.read",

  // Campanhas — nomes REAIS do backend (authz/permissions.ts). `publish` cobre
  // apenas ativar; as demais ações de status usam `update`.
  CAMPAIGNS_READ: "campaigns.read",
  CAMPAIGNS_CREATE: "campaigns.create",
  CAMPAIGNS_UPDATE: "campaigns.update",
  CAMPAIGNS_DELETE: "campaigns.delete",
  CAMPAIGNS_PUBLISH: "campaigns.publish",

  // Campanhas de WhatsApp (Sprint C1) — módulo próprio, separado de marketing.
  MESSAGING_CAMPAIGNS_READ: "messaging.campaigns.read",
  MESSAGING_CAMPAIGNS_CREATE: "messaging.campaigns.create",
  MESSAGING_CAMPAIGNS_UPDATE: "messaging.campaigns.update",
  MESSAGING_CAMPAIGNS_DELETE: "messaging.campaigns.delete",
  MESSAGING_CAMPAIGNS_SEND: "messaging.campaigns.send",
  MESSAGING_CAMPAIGNS_CANCEL: "messaging.campaigns.cancel",
  MESSAGING_SUPPRESSION_MANAGE: "messaging.suppression.manage",

  // Origens de lead e atribuição — nomes REAIS do backend (Sprint 1.5A-2).
  MARKETING_LEAD_SOURCES_READ: "marketing.lead_sources.read",
  MARKETING_LEAD_SOURCES_MANAGE: "marketing.lead_sources.manage",
  MARKETING_ATTRIBUTION_READ: "marketing.attribution.read",
  MARKETING_ATTRIBUTION_CREATE: "marketing.attribution.create",
  MARKETING_ATTRIBUTION_UPDATE: "marketing.attribution.update",
  MARKETING_ATTRIBUTION_DELETE: "marketing.attribution.delete",

  // Integrações — nomes REAIS do backend (authz/permissions.ts). Não há
  // permissão dedicada a ativar/pausar: o backend usa `update` para ambas.
  INTEGRATIONS_CONNECTIONS_READ: "integrations.connections.read",
  INTEGRATIONS_CONNECTIONS_CREATE: "integrations.connections.create",
  INTEGRATIONS_CONNECTIONS_UPDATE: "integrations.connections.update",
  INTEGRATIONS_CONNECTIONS_DELETE: "integrations.connections.delete",
  INTEGRATIONS_CONNECTIONS_TEST: "integrations.connections.test",
  INTEGRATIONS_LOGS_READ: "integrations.logs.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
