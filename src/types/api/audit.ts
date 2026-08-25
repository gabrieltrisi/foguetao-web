import { z } from "zod";

/**
 * AuditLogResponseDto. O `action` é validado como string (não como enum): o
 * backend tem 114 ações e pode acrescentar mais — travar num enum quebraria a
 * leitura sem ganho. O `metadata` já chega SANITIZADO do backend (chaves
 * sensíveis redigidas); ainda assim é `unknown` e nunca renderizado cru.
 */
export const auditActorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
export type ApiAuditActor = z.infer<typeof auditActorSchema>;

export const auditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().nullable(),
  userId: z.string().nullable(),
  actor: auditActorSchema.nullable(),
  requestId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
});
export type ApiAuditLog = z.infer<typeof auditLogSchema>;

export const auditListSchema = z.object({
  items: z.array(auditLogSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type ApiAuditList = z.infer<typeof auditListSchema>;

/** Filtros reais de GET /audit. */
export interface AuditFilters {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
}
