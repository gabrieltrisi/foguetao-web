/** Chaves de query centralizadas para invalidação consistente. */
export const queryKeys = {
  session: ["session"] as const,
  sessions: ["auth", "sessions"] as const,
  members: (companyId: string | null) => ["company", companyId, "members"] as const,

  company: {
    /** Dados da empresa ativa (GET /companies/:companyId). */
    current: () => ["company", "current"] as const,
    /** Lista de membros por filtro. */
    members: (filters?: unknown) => ["company", "members", filters ?? {}] as const,
    member: (id: string) => ["company", "member", id] as const,
    invitations: (filters?: unknown) => ["company", "invitations", filters ?? {}] as const,
  },

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

    pipelines: (filters?: unknown) => ["crm", "pipelines", filters ?? {}] as const,
    pipeline: (id: string) => ["crm", "pipeline", id] as const,
    pipelineStages: (id: string) => ["crm", "pipeline", id, "stages"] as const,

    deals: (filters?: unknown) => ["crm", "deals", filters ?? {}] as const,
    deal: (id: string) => ["crm", "deal", id] as const,
    dealHistory: (id: string) => ["crm", "deal", id, "history"] as const,
    dealActivities: (id: string) => ["crm", "deal", id, "activities"] as const,
    lostReasons: () => ["crm", "lost-reasons"] as const,
    /** Board do Kanban de um pipeline (colunas + 1ª página por coluna). */
    kanban: (pipelineId: string) => ["crm", "kanban", pipelineId] as const,

    tasks: (filters?: unknown) => ["crm", "tasks", filters ?? {}] as const,
    task: (id: string) => ["crm", "task", id] as const,
  },

  integrations: {
    /** Catálogo do produto: muda com deploy, não com uso → staleTime longo. */
    catalog: (filters?: unknown) => ["integrations", "catalog", filters ?? {}] as const,
    catalogItem: (key: string) => ["integrations", "catalog-item", key] as const,
    connections: (filters?: unknown) => ["integrations", "connections", filters ?? {}] as const,
    connection: (id: string) => ["integrations", "connection", id] as const,
    logs: (id: string, filters?: unknown) =>
      ["integrations", "connection", id, "logs", filters ?? {}] as const,
  },
} as const;

/**
 * Prefixos de invalidação de empresa (membros/convites). Domínio separado de
 * `crm` e de `integrations`.
 */
export const companyInvalidation = {
  current: ["company", "current"] as const,
  allMembers: ["company", "members"] as const,
  member: (id: string) => ["company", "member", id] as const,
  allInvitations: ["company", "invitations"] as const,
};

/** Prefixos para invalidação ampla. */
export const crmInvalidation = {
  allContacts: ["crm", "contacts"] as const,
  contact: (id: string) => ["crm", "contact", id] as const,
  allOrganizations: ["crm", "organizations"] as const,
  organization: (id: string) => ["crm", "organization", id] as const,
  allPipelines: ["crm", "pipelines"] as const,
  pipeline: (id: string) => ["crm", "pipeline", id] as const,
  allDeals: ["crm", "deals"] as const,
  deal: (id: string) => ["crm", "deal", id] as const,
  kanban: (pipelineId: string) => ["crm", "kanban", pipelineId] as const,
  /** Prefixo de TODAS as listas de tarefas (qualquer filtro). */
  allTasks: ["crm", "tasks"] as const,
  task: (id: string) => ["crm", "task", id] as const,
};

/**
 * Prefixos de invalidação de integrações. Domínio separado de `crm`: invalidar
 * integrações NUNCA toca contatos, deals, pipelines ou tarefas.
 */
export const integrationsInvalidation = {
  allCatalog: ["integrations", "catalog"] as const,
  allConnections: ["integrations", "connections"] as const,
  connection: (id: string) => ["integrations", "connection", id] as const,
  /** Prefixo dos logs de UMA conexão (qualquer filtro). */
  logs: (id: string) => ["integrations", "connection", id, "logs"] as const,
};
