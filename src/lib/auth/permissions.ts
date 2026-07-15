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
