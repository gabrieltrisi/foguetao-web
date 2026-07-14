import "server-only";
import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/types/api/error";

/** Converte um erro em resposta JSON estável para o cliente do BFF. */
export function errorResponse(error: unknown): NextResponse {
  if (isApiError(error)) {
    const status = error.isUnavailable ? 503 : error.statusCode || 500;
    return NextResponse.json(
      { statusCode: status, code: error.code, message: error.message, details: error.details },
      { status },
    );
  }
  return NextResponse.json(
    { statusCode: 500, code: "INTERNAL_ERROR", message: "Erro inesperado" },
    { status: 500 },
  );
}

/** Envolve um handler de rota, padronizando o tratamento de erros. */
export function route(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((error) => errorResponse(error));
}

export { ApiError };
