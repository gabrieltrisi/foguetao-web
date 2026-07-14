/** Chaves de query centralizadas para invalidação consistente. */
export const queryKeys = {
  session: ["session"] as const,
  sessions: ["auth", "sessions"] as const,
  members: (companyId: string | null) => ["company", companyId, "members"] as const,

  crm: {
    contacts: (filters?: unknown) => ["crm", "contacts", filters ?? {}] as const,
    contact: (id: string) => ["crm", "contact", id] as const,
    contactNotes: (id: string) => ["crm", "contact", id, "notes"] as const,
    contactActivities: (id: string) => ["crm", "contact", id, "activities"] as const,
    tags: () => ["crm", "tags"] as const,
    customFieldDefs: (entity?: string) => ["crm", "custom-fields", entity ?? "all"] as const,
    organizations: (filters?: unknown) => ["crm", "organizations", filters ?? {}] as const,
    organization: (id: string) => ["crm", "organization", id] as const,
    orgContacts: (id: string) => ["crm", "organization", id, "contacts"] as const,
  },
} as const;

/** Prefixos para invalidação ampla. */
export const crmInvalidation = {
  allContacts: ["crm", "contacts"] as const,
  contact: (id: string) => ["crm", "contact", id] as const,
  allOrganizations: ["crm", "organizations"] as const,
  organization: (id: string) => ["crm", "organization", id] as const,
};
