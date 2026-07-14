import { z } from "zod";

/* ---------- Enums (backend) ---------- */
export const contactStatusSchema = z.enum([
  "LEAD",
  "ACTIVE",
  "CUSTOMER",
  "INACTIVE",
  "BLOCKED",
  "ARCHIVED",
]);
export type ContactStatusApi = z.infer<typeof contactStatusSchema>;

export const contactSourceSchema = z.enum([
  "MANUAL",
  "IMPORT",
  "WHATSAPP",
  "META_ADS",
  "GOOGLE_ADS",
  "AFFILIATE",
  "LANDING_PAGE",
  "API",
  "OTHER",
]);
export type ContactSourceApi = z.infer<typeof contactSourceSchema>;

export const organizationSizeSchema = z.enum([
  "SOLO",
  "MICRO",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "ENTERPRISE",
]);
export type OrganizationSizeApi = z.infer<typeof organizationSizeSchema>;

export const customFieldTypeSchema = z.enum([
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "SELECT",
  "MULTISELECT",
  "EMAIL",
  "PHONE",
  "URL",
  "JSON",
]);
export type CustomFieldTypeApi = z.infer<typeof customFieldTypeSchema>;

/* ---------- Paginação genérica ---------- */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  });
}
export type Paginated<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };

/* ---------- Contact ---------- */
export const contactSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  fullName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  whatsappPhone: z.string().nullable(),
  document: z.string().nullable(),
  jobTitle: z.string().nullable(),
  status: contactStatusSchema,
  source: contactSourceSchema.nullable(),
  organizationId: z.string().nullable(),
  assignedToUserId: z.string().nullable(),
  lastActivityAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiContact = z.infer<typeof contactSchema>;
export const contactListSchema = paginated(contactSchema);

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  description: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});
export type ApiTag = z.infer<typeof tagSchema>;
export const tagListSchema = paginated(tagSchema);
/** Tag reduzida usada no detalhe do contato. */
export const contactTagSchema = z.object({ id: z.string(), name: z.string(), color: z.string().nullable() });

export const noteSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  authorUserId: z.string(),
  content: z.string(),
  pinned: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});
export type ApiNote = z.infer<typeof noteSchema>;
export const noteListSchema = paginated(noteSchema);

export const activitySchema = z.object({
  id: z.string(),
  contactId: z.string(),
  userId: z.string().nullable().optional(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  metadata: z.unknown().nullable().optional(),
  occurredAt: z.string(),
  createdAt: z.string(),
});
export type ApiActivity = z.infer<typeof activitySchema>;
export const activityListSchema = paginated(activitySchema);

export const customFieldDefSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  name: z.string(),
  key: z.string(),
  type: customFieldTypeSchema,
  description: z.string().nullable(),
  required: z.boolean(),
  active: z.boolean(),
  options: z.array(z.string()).nullable().optional(),
  position: z.number().optional(),
  createdAt: z.string().optional(),
});
export type ApiCustomFieldDef = z.infer<typeof customFieldDefSchema>;
export const customFieldDefListSchema = z.array(customFieldDefSchema);

/** Valor de campo personalizado (shape lenient — backend pode evoluir). */
export const customFieldValueSchema = z
  .object({ fieldId: z.string().optional(), key: z.string().optional(), value: z.unknown() })
  .passthrough();

/** Detalhe do contato (objeto rico agregado). `contact` é lenient (raw prisma). */
export const contactDetailSchema = z.object({
  contact: contactSchema.passthrough(),
  organization: z.object({ id: z.string(), name: z.string() }).nullable(),
  assignee: z.object({ id: z.string(), name: z.string(), email: z.string() }).nullable(),
  tags: z.array(contactTagSchema),
  customFields: z.array(customFieldValueSchema),
  recentNotes: z.array(noteSchema),
  recentActivities: z.array(activitySchema),
  counters: z.object({ notes: z.number(), activities: z.number(), tags: z.number() }),
});
export type ApiContactDetail = z.infer<typeof contactDetailSchema>;

/* ---------- Organization ---------- */
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string().nullable(),
  document: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  industry: z.string().nullable(),
  size: organizationSizeSchema.nullable(),
  address: z.unknown().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ApiOrganization = z.infer<typeof organizationSchema>;
export const organizationListSchema = paginated(organizationSchema);

export const orgContactSummarySchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().nullable(),
  status: contactStatusSchema,
});
export type ApiOrgContactSummary = z.infer<typeof orgContactSummarySchema>;
export const orgContactListSchema = paginated(orgContactSummarySchema);
