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
