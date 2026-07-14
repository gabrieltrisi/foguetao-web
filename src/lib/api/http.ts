import "server-only";
import { z } from "zod";
import { apiErrorFromResponse, unavailableError } from "@/types/api/error";
import { backendUrl, COMPANY_ID_HEADER } from "./config";

export interface BackendRequest<TSchema extends z.ZodTypeAny | undefined> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON body (será serializado). */
  body?: unknown;
  /** Access token (Bearer). Nunca logado. */
  token?: string | null;
  /** Empresa ativa → header x-company-id. */
  companyId?: string | null;
  /** Schema Zod para validação defensiva da resposta. */
  schema?: TSchema;
  /** Sinal de cancelamento opcional. */
  signal?: AbortSignal;
}

type Result<TSchema> = TSchema extends z.ZodTypeAny ? z.infer<TSchema> : unknown;

/**
 * Chamada tipada ao backend (uso EXCLUSIVO server-side / route handlers).
 * - Anexa Authorization: Bearer e x-company-id quando fornecidos.
 * - Normaliza erros do backend em ApiError (formato estável).
 * - Converte falha de rede em erro "indisponível" (statusCode 0).
 * - Nunca inclui o token em mensagens de erro/logs.
 */
export async function backendFetch<TSchema extends z.ZodTypeAny | undefined = undefined>(
  path: string,
  { method = "GET", body, token, companyId, schema, signal }: BackendRequest<TSchema> = {},
): Promise<Result<TSchema>> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  if (companyId) headers[COMPANY_ID_HEADER] = companyId;

  let response: Response;
  try {
    response = await fetch(backendUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal,
    });
  } catch {
    // Falha de rede / DNS / conexão recusada → backend indisponível.
    throw unavailableError("Não foi possível conectar ao servidor");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    throw apiErrorFromResponse(response.status, payload);
  }

  if (schema) {
    return schema.parse(payload) as Result<TSchema>;
  }
  return payload as Result<TSchema>;
}
