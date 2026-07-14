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

export const memberListSchema = z.object({
  items: z.array(memberSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type MemberList = z.infer<typeof memberListSchema>;
