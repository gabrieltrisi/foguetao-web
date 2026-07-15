import "server-only";
import { z } from "zod";
import { ApiError, ErrorCode } from "@/types/api/error";

/**
 * Validação de entrada no BFF (defesa em profundidade). Espelha as regras do
 * backend — requisições válidas seguem idênticas; as inválidas são rejeitadas
 * antes de sair da rede interna, no MESMO formato de erro do backend.
 */

const uuidSchema = z.string().uuid();

/** Falha com 400 VALIDATION_ERROR no formato padrão de erro. */
function fail(message: string, details: unknown[] = []): never {
  throw new ApiError({ statusCode: 400, code: ErrorCode.VALIDATION_ERROR, message, details });
}

/** Valida um id de rota (UUID). Evita repassar path params arbitrários. */
export function requireUuid(value: string, field = "id"): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) fail(`${field} inválido`, [`${field} deve ser um UUID`]);
  return parsed.data;
}

/** expectedVersion: inteiro >= 1 (optimistic locking). */
export const expectedVersionSchema = z.number().int().min(1);

/** Corpo das ações de deal que exigem optimistic locking. */
export const dealActionBodySchema = z
  .object({ expectedVersion: expectedVersionSchema })
  .passthrough();

/** Valida o corpo de uma ação com expectedVersion. */
export function parseDealActionBody(body: unknown): Record<string, unknown> {
  const parsed = dealActionBodySchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "expectedVersion é obrigatório",
      parsed.error.issues.map((i) => i.message),
    );
  }
  return parsed.data;
}

/** Corpo de POST /tasks/:id/assign. */
export function parseAssignBody(body: unknown): { assignedToUserId: string } {
  const parsed = z.object({ assignedToUserId: uuidSchema }).safeParse(body);
  if (!parsed.success) {
    fail("assignedToUserId inválido", ["assignedToUserId deve ser um UUID"]);
  }
  return parsed.data;
}

const CRM_MAX_LIMIT = 100;

/**
 * Filtros de GET /tasks — espelha ListTasksQueryDto: enums, uuids, datas
 * ISO-8601, `overdue` booleano e `sortBy` em allowlist. Entradas inválidas são
 * rejeitadas aqui, antes de sair da rede interna.
 */
const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CRM_MAX_LIMIT).optional(),
  search: z.string().max(200).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToUserId: uuidSchema.optional(),
  dealId: uuidSchema.optional(),
  contactId: uuidSchema.optional(),
  organizationId: uuidSchema.optional(),
  overdue: z.enum(["true", "false"]).optional(),
  dueFrom: z.string().datetime({ offset: true }).optional(),
  dueTo: z.string().datetime({ offset: true }).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueAt", "priority", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export function parseTaskListQuery(
  params: Record<string, string | string[]>,
): Record<string, string | number> {
  // arrays não são suportados por nenhum filtro de tarefas
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v !== "") flat[k] = v;
  }

  const parsed = taskQuerySchema.safeParse(flat);
  if (!parsed.success) {
    fail(
      "Filtros inválidos",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }

  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) out[k] = v as string | number;
  }
  return out;
}

const KANBAN_MAX_LIMIT = 50;

/**
 * Sanitiza a paginação do Kanban: `limit` clampado em 1..50 (limite do
 * backend) e `cursor` obrigatoriamente UUID (é o id do último deal).
 */
export function parseKanbanQuery(params: Record<string, string | string[]>): {
  limit?: number;
  cursor?: string;
} {
  const out: { limit?: number; cursor?: string } = {};

  const rawLimit = typeof params.limit === "string" ? params.limit : undefined;
  if (rawLimit !== undefined) {
    const n = Number(rawLimit);
    if (!Number.isInteger(n) || n < 1) fail("limit inválido", ["limit deve ser um inteiro >= 1"]);
    out.limit = Math.min(n, KANBAN_MAX_LIMIT);
  }

  const rawCursor = typeof params.cursor === "string" ? params.cursor : undefined;
  if (rawCursor !== undefined && rawCursor !== "") {
    out.cursor = requireUuid(rawCursor, "cursor");
  }

  return out;
}

/* ---------- Integrações (Sprint 1.0D-1) ---------- */

/**
 * Chave do catálogo. NÃO é UUID (é estável e legível, ex.: `GOOGLE_ANALYTICS_4`),
 * então tem allowlist de formato própria: só A-Z, 0-9 e `_`. Impede path
 * traversal e qualquer string arbitrária de chegar ao backend.
 */
const catalogKeySchema = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[A-Z0-9_]+$/, "deve conter apenas A-Z, 0-9 e _");

export function requireCatalogKey(value: string): string {
  const parsed = catalogKeySchema.safeParse(value);
  if (!parsed.success) fail("key inválida", ["key deve conter apenas A-Z, 0-9 e _"]);
  return parsed.data;
}

/**
 * Config PÚBLICA de conexão. O backend já rejeita segredo (schema `.strict()`
 * por provider + barreira anti-segredo); aqui rejeitamos cedo, para que uma
 * chave secreta digitada por engano no campo errado nem saia da rede interna.
 */
// Separadores opcionais: `privateKey`, `private_key` e `private-key` são o
// mesmo risco — exigir underscore deixaria camelCase passar.
const SECRET_LIKE =
  /(secret|token|passw|api[_-]?key|credential|private[_-]?key|authorization|bearer)/i;

function assertNoSecretKeys(config: Record<string, unknown>): void {
  const offenders = Object.keys(config).filter((k) => SECRET_LIKE.test(k));
  if (offenders.length > 0) {
    fail("A configuração pública não aceita segredos", [
      `Use o fluxo de credenciais para: ${offenders.join(", ")}`,
    ]);
  }
}

const connectionConfigSchema = z.record(z.string(), z.unknown()).optional();

const createConnectionSchema = z.object({
  provider: z.string().min(1).max(40),
  category: z.string().min(1).max(40),
  name: z.string().trim().min(1).max(160),
  environment: z.enum(["SANDBOX", "PRODUCTION"]).optional(),
  config: connectionConfigSchema,
});

export function parseCreateConnectionBody(body: unknown): Record<string, unknown> {
  const parsed = createConnectionSchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "Dados da conexão inválidos",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  if (parsed.data.config) assertNoSecretKeys(parsed.data.config);
  return parsed.data;
}

/** PATCH: provider e category são imutáveis no backend e nem são aceitos aqui. */
const updateConnectionSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    environment: z.enum(["SANDBOX", "PRODUCTION"]).optional(),
    config: connectionConfigSchema,
  })
  .strict();

export function parseUpdateConnectionBody(body: unknown): Record<string, unknown> {
  const parsed = updateConnectionSchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "Dados da conexão inválidos",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  if (parsed.data.config) assertNoSecretKeys(parsed.data.config);
  return parsed.data;
}

const catalogQuerySchema = z.object({
  category: z
    .enum([
      "MESSAGING",
      "ADVERTISING",
      "ANALYTICS",
      "AUTOMATION",
      "PRODUCTIVITY",
      "STORAGE",
      "WEBHOOKS",
      "CUSTOM",
    ])
    .optional(),
  availability: z.enum(["AVAILABLE", "COMING_SOON", "DISABLED"]).optional(),
  search: z.string().max(200).optional(),
});

const connectionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CRM_MAX_LIMIT).optional(),
  search: z.string().max(200).optional(),
  provider: z
    .enum([
      "WHATSAPP_CLOUD",
      "EVOLUTION",
      "META_ADS",
      "GOOGLE_ADS",
      "SMTP",
      "SENDGRID",
      "AMAZON_SES",
      "S3",
      "CLOUDFLARE_R2",
      "STRIPE",
      "CUSTOM_WEBHOOK",
      "MOCK",
    ])
    .optional(),
  category: z
    .enum(["MESSAGING", "ADVERTISING", "EMAIL", "STORAGE", "PAYMENT", "AUTOMATION", "CUSTOM"])
    .optional(),
  status: z
    .enum(["DRAFT", "CONNECTING", "CONNECTED", "DEGRADED", "ERROR", "DISCONNECTED", "REVOKED"])
    .optional(),
  environment: z.enum(["SANDBOX", "PRODUCTION"]).optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "lastSuccessfulAt", "lastFailureAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const logListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CRM_MAX_LIMIT).optional(),
  status: z.enum(["SUCCESS", "FAILURE", "TIMEOUT", "RATE_LIMITED", "CIRCUIT_OPEN"]).optional(),
  operation: z.string().max(120).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/** Achata e valida uma query contra um schema, descartando vazios e arrays. */
function parseQueryWith<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | string[]>,
): Record<string, string | number> {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v !== "") flat[k] = v;
  }
  const parsed = schema.safeParse(flat);
  if (!parsed.success) {
    fail(
      "Filtros inválidos",
      (parsed.error as z.ZodError).issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(parsed.data as Record<string, unknown>)) {
    if (v !== undefined) out[k] = v as string | number;
  }
  return out;
}

export function parseCatalogQuery(params: Record<string, string | string[]>) {
  return parseQueryWith(catalogQuerySchema, params);
}

export function parseConnectionListQuery(params: Record<string, string | string[]>) {
  return parseQueryWith(connectionListQuerySchema, params);
}

export function parseLogListQuery(params: Record<string, string | string[]>) {
  return parseQueryWith(logListQuerySchema, params);
}

/* ---------- Membros e convites (Sprint 1.0D-2) ---------- */

const companyRoleValues = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "MARKETING",
  "COMMERCIAL",
  "SUPPORT",
  "FINANCIAL",
  "AFFILIATE",
  "VIEWER",
] as const;

const memberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CRM_MAX_LIMIT).optional(),
  // o backend limita a busca de membros a 120 chars
  search: z.string().max(120).optional(),
  status: z.enum(["INVITED", "ACTIVE", "SUSPENDED", "REMOVED"]).optional(),
  role: z.enum(companyRoleValues).optional(),
});

export function parseMemberListQuery(params: Record<string, string | string[]>) {
  return parseQueryWith(memberListQuerySchema, params);
}

/** Convites: o backend só aceita busca + paginação (sem filtro de status). */
const invitationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CRM_MAX_LIMIT).optional(),
  search: z.string().max(200).optional(),
});

export function parseInvitationListQuery(params: Record<string, string | string[]>) {
  return parseQueryWith(invitationListQuerySchema, params);
}

/**
 * PATCH de membro. `.strict()` porque o backend só aceita role/status — e
 * `status` é limitado a ACTIVE|SUSPENDED (REMOVED/INVITED viram 400 lá).
 * Bloqueia de saída qualquer tentativa de mandar companyId/userId pelo corpo.
 */
const updateMemberSchema = z
  .object({
    role: z.enum(companyRoleValues).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  })
  .strict()
  .refine((v) => v.role !== undefined || v.status !== undefined, {
    message: "informe role e/ou status",
  });

export function parseUpdateMemberBody(body: unknown): Record<string, unknown> {
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "Dados do membro inválidos",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  return parsed.data;
}

/** POST de convite. O backend recusa role OWNER (403) — rejeitamos antes. */
const createInvitationSchema = z
  .object({
    email: z.string().trim().min(3).max(255).email(),
    role: z.enum(companyRoleValues),
  })
  .strict();

export function parseCreateInvitationBody(body: unknown): Record<string, unknown> {
  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "Dados do convite inválidos",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  return parsed.data;
}

/**
 * Token de convite: 64 chars hex opacos (randomBytes(32).toString('hex')).
 * Allowlist de formato impede path traversal e string arbitrária no path.
 */
const inviteTokenSchema = z.string().regex(/^[a-f0-9]{64}$/, "token inválido");

export function requireInviteToken(value: unknown): string {
  const parsed = inviteTokenSchema.safeParse(value);
  if (!parsed.success) fail("token inválido", ["token deve ter 64 caracteres hexadecimais"]);
  return parsed.data;
}
