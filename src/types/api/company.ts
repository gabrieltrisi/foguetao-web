import { z } from "zod";

export const companyRoleSchema = z.enum([
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MARKETING",
  "COMMERCIAL",
  "SUPPORT",
  "FINANCIAL",
  "AFFILIATE",
  "VIEWER",
]);
export type CompanyRole = z.infer<typeof companyRoleSchema>;

export const companyStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]);
export type CompanyStatus = z.infer<typeof companyStatusSchema>;

export const companyPlanSchema = z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]);
export type CompanyPlan = z.infer<typeof companyPlanSchema>;

export const membershipStatusSchema = z.enum(["INVITED", "ACTIVE", "SUSPENDED", "REMOVED"]);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

/** CompanySummaryDto: GET /companies. */
export const companySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: companyStatusSchema,
  plan: companyPlanSchema,
  role: companyRoleSchema,
});
export type CompanySummary = z.infer<typeof companySummarySchema>;
export const companySummaryListSchema = z.array(companySummarySchema);

/** CompanyResponseDto: detalhes. */
export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  legalName: z.string().nullable(),
  document: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  logoUrl: z.string().nullable(),
  timezone: z.string(),
  locale: z.string(),
  currency: z.string(),
  status: companyStatusSchema,
  plan: companyPlanSchema,
  createdAt: z.string(),
});
export type ApiCompany = z.infer<typeof companySchema>;

/**
 * Campos que o backend REALMENTE aceita no PATCH /companies/:companyId.
 *
 * Fora da lista de propósito, porque o backend recusa (ValidationPipe com
 * forbidNonWhitelisted → 400):
 *  - `slug`: imutável após a criação (nem é recalculado ao renomear);
 *  - `plan` e `status`: não são editáveis por rota alguma.
 *
 * `settings` é aceito no PATCH mas NUNCA devolvido por nenhuma resposta
 * (verificado contra a API): gravar seria um buraco negro, então a UI não o
 * expõe. Ver limitações na doc.
 */
export interface UpdateCompanyInput {
  name?: string;
  legalName?: string;
  document?: string;
  email?: string;
  phone?: string;
  /** IANA (ex.: America/Sao_Paulo). O backend valida via Intl. */
  timezone?: string;
  /** BCP 47 (ex.: pt-BR). */
  locale?: string;
  /** ISO 4217, 3 letras maiúsculas. */
  currency?: string;
  logoUrl?: string;
}

/** ContextResponseDto: GET /companies/:id/context (role + permissões). */
export const companyContextSchema = z.object({
  company: companySchema,
  role: companyRoleSchema,
  membershipStatus: membershipStatusSchema,
  isOwner: z.boolean(),
  permissions: z.array(z.string()),
});
export type CompanyContext = z.infer<typeof companyContextSchema>;

/** MemberResponseDto + paginação: GET /companies/:id/members. */
export const memberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  role: companyRoleSchema,
  status: membershipStatusSchema,
  joinedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ApiMember = z.infer<typeof memberSchema>;

/**
 * Paginação de membros/convites. ATENÇÃO: o backend NÃO devolve `totalPages`
 * aqui (diferente do CRM) — a UI calcula. Inventar o campo faria o Zod
 * rejeitar a resposta real.
 */
export const memberListSchema = z.object({
  items: z.array(memberSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type MemberList = z.infer<typeof memberListSchema>;

/* ---------- Convites ---------- */

/**
 * InvitationResponseDto. Não existe enum de status: ele é DERIVADO de
 * acceptedAt/revokedAt/expiresAt (ver `invitationStatus()` em lib/company/team.ts).
 * `tokenHash` nunca é exposto.
 */
export const invitationSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  email: z.string(),
  role: companyRoleSchema,
  expiresAt: z.string(),
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ApiInvitation = z.infer<typeof invitationSchema>;

export const invitationListSchema = z.object({
  items: z.array(invitationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type InvitationList = z.infer<typeof invitationListSchema>;

/**
 * Resposta de POST /invitations. `token` só vem FORA de produção (o backend
 * ainda não envia e-mail) — por isso é opcional no contrato.
 */
export const createInvitationResultSchema = z.object({
  invitation: invitationSchema,
  token: z.string().optional(),
  devToken: z.string().optional(),
});
export type ApiCreateInvitationResult = z.infer<typeof createInvitationResultSchema>;

/** Resposta de POST /invitations/:token/accept. */
export const acceptInvitationResultSchema = z.object({
  company: companySchema,
  role: companyRoleSchema,
});
export type ApiAcceptInvitationResult = z.infer<typeof acceptInvitationResultSchema>;

export const messageResultSchema = z.object({ message: z.string() });

/* ---------- Inputs ---------- */

/** PATCH member: o backend só aceita ACTIVE|SUSPENDED (REMOVED/INVITED = 400). */
export const patchableMemberStatus = ["ACTIVE", "SUSPENDED"] as const;
export type PatchableMemberStatus = (typeof patchableMemberStatus)[number];

export interface UpdateMemberInput {
  role?: CompanyRole;
  status?: PatchableMemberStatus;
}

export interface CreateInvitationInput {
  email: string;
  role: CompanyRole;
}

/** Filtros reais de GET members. NÃO existe sortBy (ordem fixa: createdAt asc). */
export interface MemberFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: MembershipStatus;
  role?: CompanyRole;
}

/** Filtros reais de GET invitations: SOMENTE busca por e-mail + paginação. */
export interface InvitationFilters {
  page?: number;
  limit?: number;
  search?: string;
}
