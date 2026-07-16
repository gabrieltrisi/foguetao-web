import "server-only";
import { backendFetch } from "@/lib/api/http";
import { endpoints } from "@/lib/api/config";
import {
  authTokensSchema,
  tokenPairSchema,
  userSchema,
  sessionListSchema,
  messageResponseSchema,
  type AuthTokens,
  type TokenPair,
  type ApiUser,
  type ApiSession,
} from "@/types/api/auth";
import {
  companySummaryListSchema,
  companyContextSchema,
  type CompanySummary,
  type CompanyContext,
} from "@/types/api/company";

/** POST /auth/login — retorna tokens + usuário. */
export function loginRequest(
  email: string,
  password: string,
  userAgent?: string | null,
): Promise<AuthTokens> {
  return backendFetch(endpoints.login, {
    method: "POST",
    body: { email, password },
    schema: authTokensSchema,
    userAgent,
  });
}

/** POST /auth/refresh — rotaciona o par de tokens. */
export function refreshRequest(
  refreshToken: string,
  userAgent?: string | null,
): Promise<TokenPair> {
  return backendFetch(endpoints.refresh, {
    method: "POST",
    body: { refreshToken },
    schema: tokenPairSchema,
    userAgent,
  });
}

/** POST /auth/logout — revoga a sessão atual (idempotente). */
export function logoutRequest(token: string): Promise<unknown> {
  return backendFetch(endpoints.logout, { method: "POST", token, schema: messageResponseSchema });
}

/** POST /auth/logout-all — revoga todas as sessões. */
export function logoutAllRequest(token: string): Promise<{ message: string }> {
  return backendFetch(endpoints.logoutAll, {
    method: "POST",
    token,
    schema: messageResponseSchema,
  });
}

/** GET /auth/me — usuário autenticado. */
export function meRequest(token: string): Promise<ApiUser> {
  return backendFetch(endpoints.me, { token, schema: userSchema });
}

/** GET /auth/sessions — sessões ativas do usuário. */
export function listSessionsRequest(token: string): Promise<ApiSession[]> {
  return backendFetch(endpoints.sessions, { token, schema: sessionListSchema });
}

/** DELETE /auth/sessions/:id — revoga uma sessão específica. */
export function revokeSessionRequest(token: string, id: string): Promise<{ message: string }> {
  return backendFetch(endpoints.session(id), {
    method: "DELETE",
    token,
    schema: messageResponseSchema,
  });
}

/** GET /companies — empresas com membership ativa do usuário. */
export function listCompaniesRequest(token: string): Promise<CompanySummary[]> {
  return backendFetch(endpoints.companies, { token, schema: companySummaryListSchema });
}

/** GET /companies/:id/context — role, status e permissões na empresa. */
export function companyContextRequest(token: string, companyId: string): Promise<CompanyContext> {
  return backendFetch(endpoints.companyContext(companyId), {
    token,
    companyId,
    schema: companyContextSchema,
  });
}

/** GET /companies/:id/members — membros (paginado). Exige company.members.read. */
