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
    /** RBAC estático — muda com deploy, não com uso → staleTime longo. */
    roles: () => ["company", "roles"] as const,
    permissionCatalog: () => ["company", "permission-catalog"] as const,
    /** Auditoria: lista por filtro e detalhe. */
    audit: (filters?: unknown) => ["company", "audit", filters ?? {}] as const,
    auditEntry: (id: string) => ["company", "audit", "entry", id] as const,
  },

  crm: {
    contacts: (filters?: unknown) => ["crm", "contacts", filters ?? {}] as const,
    contact: (id: string) => ["crm", "contact", id] as const,
    contactNotes: (id: string) => ["crm", "contact", id, "notes"] as const,
    contactActivities: (id: string) => ["crm", "contact", id, "activities"] as const,
    /** Sem filtros → lista de associação; com filtros → gestão de tags. */
    tags: (filters?: unknown) => ["crm", "tags", filters ?? {}] as const,
    tag: (id: string) => ["crm", "tag", id] as const,
    customFieldDefs: (entity?: string) => ["crm", "custom-fields", entity ?? "all"] as const,
    /** Valores da organização — o contato traz os seus no próprio detalhe. */
    orgCustomFields: (id: string) => ["crm", "organization", id, "custom-fields"] as const,
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

    /** Resumo comercial do dashboard, por filtro (pipeline + período). */
    metricsSummary: (filters?: unknown) => ["crm", "metrics", "summary", filters ?? {}] as const,
  },

  /** Marketing (Sprints 1.5A-1 e 1.5A-2). Campanhas: paginação por offset. */
  marketing: {
    campaigns: (filters?: unknown) => ["marketing", "campaigns", filters ?? {}] as const,
    campaign: (id: string) => ["marketing", "campaign", id] as const,
    /** Catálogo de origens: pequeno e ordenado, sem paginação. */
    leadSources: (filters?: unknown) => ["marketing", "lead-sources", filters ?? {}] as const,
    leadSource: (id: string) => ["marketing", "lead-source", id] as const,
    /**
     * Histórico de atribuição de UM contato. Fica sob `marketing` (e não `crm`)
     * porque o dono do domínio é Marketing — invalidar contatos não deve
     * refazer esta query, e vice-versa.
     */
    contactAttributions: (contactId: string) =>
      ["marketing", "attributions", "contact", contactId] as const,
    /** Leads de UMA campanha (contagem de contatos, sem métrica de mídia). */
    campaignAttributions: (campaignId: string, filters?: unknown) =>
      ["marketing", "attributions", "campaign", campaignId, filters ?? {}] as const,
  },

  /** Messaging (Sprint 1.3). Conversas e mensagens paginam por cursor. */
  messaging: {
    conversations: (filters?: unknown) => ["messaging", "conversations", filters ?? {}] as const,
    conversation: (id: string) => ["messaging", "conversation", id] as const,
    messages: (conversationId: string, filters?: unknown) =>
      ["messaging", "conversation", conversationId, "messages", filters ?? {}] as const,
    message: (id: string) => ["messaging", "message", id] as const,
    accounts: () => ["messaging", "accounts"] as const,
  },

  integrations: {
    /** Catálogo do produto: muda com deploy, não com uso → staleTime longo. */
    catalog: (filters?: unknown) => ["integrations", "catalog", filters ?? {}] as const,
    catalogItem: (key: string) => ["integrations", "catalog-item", key] as const,
    connections: (filters?: unknown) => ["integrations", "connections", filters ?? {}] as const,
    connection: (id: string) => ["integrations", "connection", id] as const,
    logs: (id: string, filters?: unknown) =>
      ["integrations", "connection", id, "logs", filters ?? {}] as const,
    /** Onboarding Evolution (Sprint 7.1C). QR nunca é persistido no cache além do polling. */
    evolution: {
      capabilities: () => ["integrations", "evolution", "capabilities"] as const,
      connection: (id: string) => ["integrations", "evolution", "connection", id] as const,
      qr: (id: string) => ["integrations", "evolution", "connection", id, "qr"] as const,
      webhook: (id: string) => ["integrations", "evolution", "connection", id, "webhook"] as const,
    },
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
  /** Prefixo de TODAS as listas de tags (associação e gestão). */
  allTags: ["crm", "tags"] as const,
  tag: (id: string) => ["crm", "tag", id] as const,
  /** Prefixo das definições de campos personalizados (todas as entidades). */
  allCustomFieldDefs: ["crm", "custom-fields"] as const,
};

/**
 * Prefixos de invalidação de marketing. Domínio separado: campanhas nunca
 * invalidam CRM, messaging ou integrações.
 */
export const marketingInvalidation = {
  /** Prefixo de TODAS as listas de campanhas (qualquer filtro). */
  allCampaigns: ["marketing", "campaigns"] as const,
  campaign: (id: string) => ["marketing", "campaign", id] as const,
  /** Prefixo do catálogo de origens (qualquer filtro). */
  allLeadSources: ["marketing", "lead-sources"] as const,
  leadSource: (id: string) => ["marketing", "lead-source", id] as const,
  /** Prefixo de TODA atribuição — contatos e campanhas. */
  allAttributions: ["marketing", "attributions"] as const,
  contactAttributions: (contactId: string) =>
    ["marketing", "attributions", "contact", contactId] as const,
  campaignAttributions: (campaignId: string) =>
    ["marketing", "attributions", "campaign", campaignId] as const,
};

/**
 * Prefixos de invalidação de messaging. Domínio separado: invalidar conversas
 * nunca toca CRM nem integrações.
 */
export const messagingInvalidation = {
  /** Prefixo de TODAS as listas de conversas (qualquer filtro/cursor). */
  allConversations: ["messaging", "conversations"] as const,
  conversation: (id: string) => ["messaging", "conversation", id] as const,
  /** Prefixo das mensagens de UMA conversa (qualquer filtro). */
  messages: (conversationId: string) =>
    ["messaging", "conversation", conversationId, "messages"] as const,
  allAccounts: ["messaging", "accounts"] as const,
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
