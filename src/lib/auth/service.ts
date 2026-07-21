import "server-only";
import { backendFetch } from "@/lib/api/http";
import { endpoints } from "@/lib/api/config";
import {
  authTokensSchema,
  tokenPairSchema,
  userSchema,
  sessionListSchema,
  messageResponseSchema,
  registerResponseSchema,
  type AuthTokens,
  type TokenPair,
  type ApiUser,
  type ApiSession,
  type RegisterResponse,
} from "@/types/api/auth";
import {
  companySummaryListSchema,
  companyContextSchema,
  companySchema,
  type CompanySummary,
  type CompanyContext,
  type ApiCompany,
} from "@/types/api/company";

export interface CreateCompanyBody {
  name: string;
  phone?: string;
  timezone?: string;
}

/** POST /auth/register — cria a conta (201). Envia e-mail de confirmação; não loga. */
export function registerRequest(
  input: { name: string; email: string; password: string },
  userAgent?: string | null,
): Promise<RegisterResponse> {
  return backendFetch(endpoints.register, {
    method: "POST",
    body: input,
    schema: registerResponseSchema,
    userAgent,
  });
}

/** POST /auth/verify-email — confirma o e-mail e retorna tokens (auto-login). */
export function verifyEmailRequest(token: string, userAgent?: string | null): Promise<AuthTokens> {
  return backendFetch(endpoints.verifyEmail, {
    method: "POST",
    body: { token },
    schema: authTokensSchema,
    userAgent,
  });
}

/** POST /auth/resend-verification — reenvia o e-mail de confirmação (genérico). */
export function resendVerificationRequest(
  email: string,
  userAgent?: string | null,
): Promise<{ message: string }> {
  return backendFetch(endpoints.resendVerification, {
    method: "POST",
    body: { email },
    schema: messageResponseSchema,
    userAgent,
  });
}

/**
 * POST /auth/forgot-password — solicita recuperação de senha. Resposta sempre
 * genérica (não revela se o e-mail existe). O `resetToken` que o backend possa
 * devolver em dev é descartado pelo schema — o browser nunca vê tokens.
 */
export function forgotPasswordRequest(
  email: string,
  userAgent?: string | null,
): Promise<{ message: string }> {
  return backendFetch(endpoints.forgotPassword, {
    method: "POST",
    body: { email },
    schema: messageResponseSchema,
    userAgent,
  });
}

/** POST /auth/reset-password — redefine a senha a partir do token de reset. */
export function resetPasswordRequest(
  token: string,
  newPassword: string,
  userAgent?: string | null,
): Promise<{ message: string }> {
  return backendFetch(endpoints.resetPassword, {
    method: "POST",
    body: { token, newPassword },
    schema: messageResponseSchema,
    userAgent,
  });
}

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

/** POST /companies — cria uma empresa (o criador vira OWNER). */
export function createCompanyRequest(
  token: string,
  body: CreateCompanyBody,
): Promise<ApiCompany> {
  return backendFetch(endpoints.companies, {
    method: "POST",
    token,
    body,
    schema: companySchema,
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
