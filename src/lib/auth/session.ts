import "server-only";
import { ApiError, ErrorCode } from "@/types/api/error";
import {
  getAccessToken,
  getRefreshToken,
  getActiveCompanyId,
  setSessionCookies,
  clearSessionCookies,
} from "./cookies";
import { dedupedRefresh } from "./refresh";

/** Lançado quando não há sessão utilizável (força retorno ao /login). */
export class SessionExpiredError extends ApiError {
  constructor() {
    super({ statusCode: 401, code: ErrorCode.UNAUTHORIZED, message: "Sessão expirada" });
    this.name = "SessionExpiredError";
  }
}

export interface AuthContext {
  token: string;
  companyId: string | null;
}

/**
 * Executa uma operação autenticada contra o backend com refresh coordenado:
 *  1. usa o access token atual;
 *  2. em 401, faz UM refresh deduplicado, atualiza os cookies e tenta 1x mais;
 *  3. se o refresh falhar, limpa a sessão e lança SessionExpiredError.
 *
 * Toda a lógica de token vive no servidor (route handlers); o browser só
 * enxerga cookies httpOnly.
 */
export async function withAuth<T>(fn: (ctx: AuthContext) => Promise<T>): Promise<T> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken && !refreshToken) {
    throw new SessionExpiredError();
  }

  const companyId = await getActiveCompanyId();

  if (accessToken) {
    try {
      return await fn({ token: accessToken, companyId });
    } catch (error) {
      if (!(error instanceof ApiError) || !error.isUnauthorized || !refreshToken) {
        throw error;
      }
      // cai para o fluxo de refresh abaixo
    }
  }

  if (!refreshToken) {
    await clearSessionCookies();
    throw new SessionExpiredError();
  }

  let tokens;
  try {
    tokens = await dedupedRefresh(refreshToken);
  } catch {
    await clearSessionCookies();
    throw new SessionExpiredError();
  }

  await setSessionCookies({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  return fn({ token: tokens.accessToken, companyId });
}
