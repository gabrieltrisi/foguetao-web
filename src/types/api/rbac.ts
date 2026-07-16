import { z } from "zod";
import { companyRoleSchema } from "./company";

/* ---------- Papéis ---------- */

/**
 * RoleResponseDto (GET /roles). A matriz vem do backend — o front NÃO recalcula
 * quem tem qual permissão; apenas exibe. `system` é sempre true (não há papéis
 * customizados).
 */
export const roleSchema = z.object({
  role: companyRoleSchema,
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  permissionCount: z.number(),
  rank: z.number(),
  system: z.boolean(),
  managedBy: z.array(companyRoleSchema),
  canManage: z.array(companyRoleSchema),
});
export type ApiRole = z.infer<typeof roleSchema>;

export const rolesResponseSchema = z.object({
  items: z.array(roleSchema),
});
export type ApiRolesResponse = z.infer<typeof rolesResponseSchema>;

/* ---------- Catálogo de permissões ---------- */

export const permissionSchema = z.object({
  key: z.string(),
  name: z.string(),
  actions: z.array(z.string()),
});
export type ApiPermission = z.infer<typeof permissionSchema>;

export const permissionGroupSchema = z.object({
  key: z.string(),
  name: z.string(),
  permissions: z.array(permissionSchema),
});
export type ApiPermissionGroup = z.infer<typeof permissionGroupSchema>;

export const permissionCatalogSchema = z.object({
  groups: z.array(permissionGroupSchema),
  total: z.number(),
});
export type ApiPermissionCatalog = z.infer<typeof permissionCatalogSchema>;
