import { z } from "zod";

/**
 * Formato de erro estável do backend (foguetao-api AllExceptionsFilter).
 * Ex.: { statusCode, code, message, details[], requestId, timestamp, path }
 */
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  details: z.array(z.unknown()).optional().default([]),
  requestId: z.string().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/** Códigos de erro do backend usados pelo frontend para reagir a estados. */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  COMPANY_CONTEXT_REQUIRED: "COMPANY_CONTEXT_REQUIRED",
  COMPANY_NOT_FOUND: "COMPANY_NOT_FOUND",
  COMPANY_INACTIVE: "COMPANY_INACTIVE",
  COMPANY_ACCESS_DENIED: "COMPANY_ACCESS_DENIED",
  MEMBERSHIP_INACTIVE: "MEMBERSHIP_INACTIVE",
  INSUFFICIENT_PERMISSION: "INSUFFICIENT_PERMISSION",
  INSUFFICIENT_ROLE: "INSUFFICIENT_ROLE",
  // Inbox (C3.1B/E) — conflitos de concorrência tratados de forma específica na UI.
  CONVERSATION_VERSION_CONFLICT: "CONVERSATION_VERSION_CONFLICT",
  CONVERSATION_DRAFT_CONFLICT: "CONVERSATION_DRAFT_CONFLICT",
  MESSAGING_REALTIME_DISABLED: "MESSAGING_REALTIME_DISABLED",
} as const;

export type ApiErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode] | (string & {});

/** Erro tipado propagado pela camada HTTP do frontend. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details: unknown[];
  readonly requestId?: string;

  constructor(params: {
    statusCode: number;
    code: ApiErrorCode;
    message: string;
    details?: unknown[];
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details ?? [];
    this.requestId = params.requestId;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /** Backend inacessível / indisponível (falha de rede ou 503). */
  get isUnavailable(): boolean {
    return this.statusCode === 0 || this.statusCode === 503 || this.code === ErrorCode.SERVICE_UNAVAILABLE;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidation(): boolean {
    return this.statusCode === 400 || this.code === ErrorCode.VALIDATION_ERROR;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429 || this.code === ErrorCode.TOO_MANY_REQUESTS;
  }

  /** Conflito (409) — inclui conflitos de versão/rascunho (concorrência). */
  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  /** Conflito de concorrência tratado com UI dedicada (recarregar/mesclar). */
  get isVersionConflict(): boolean {
    return (
      this.code === ErrorCode.CONVERSATION_VERSION_CONFLICT ||
      this.code === ErrorCode.CONVERSATION_DRAFT_CONFLICT
    );
  }

  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** Constrói um ApiError a partir de uma resposta de erro do backend. */
export function apiErrorFromResponse(statusCode: number, body: unknown): ApiError {
  const parsed = errorResponseSchema.safeParse(body);
  if (parsed.success) {
    return new ApiError({
      statusCode: parsed.data.statusCode || statusCode,
      code: parsed.data.code,
      message: parsed.data.message,
      details: parsed.data.details,
      requestId: parsed.data.requestId,
    });
  }
  return new ApiError({
    statusCode,
    code: statusCode === 401 ? ErrorCode.UNAUTHORIZED : ErrorCode.INTERNAL_ERROR,
    message: "Erro inesperado do servidor",
  });
}

/** Erro de rede (backend indisponível), sem resposta HTTP. */
export function unavailableError(message = "Serviço indisponível"): ApiError {
  return new ApiError({ statusCode: 0, code: ErrorCode.SERVICE_UNAVAILABLE, message });
}
