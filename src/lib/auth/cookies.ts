import "server-only";
import { cookies } from "next/headers";

/**
 * Sessão em cookies httpOnly (nunca acessíveis ao JS do browser):
 *  - fg_at  : access token (JWT curto)
 *  - fg_rt  : refresh token opaco (rotacionado)
 *  - fg_cid : id da empresa ativa (apenas o identificador)
 *
 * O refresh token NUNCA é exposto ao cliente nem persistido em localStorage.
 */
export const COOKIE = {
  access: "fg_at",
  refresh: "fg_rt",
  company: "fg_cid",
} as const;

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const isProd = process.env.NODE_ENV === "production";

function baseOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export async function setSessionCookies(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  store.set(COOKIE.access, tokens.accessToken, { ...baseOptions(), maxAge: THIRTY_DAYS });
  store.set(COOKIE.refresh, tokens.refreshToken, { ...baseOptions(), maxAge: THIRTY_DAYS });
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE.access)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE.refresh)?.value ?? null;
}

export async function getActiveCompanyId(): Promise<string | null> {
  return (await cookies()).get(COOKIE.company)?.value ?? null;
}

export async function setActiveCompanyId(companyId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE.company, companyId, { ...baseOptions(), maxAge: THIRTY_DAYS });
}

/** Limpa toda a sessão (logout / refresh falho / sessão revogada). */
export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE.access);
  store.delete(COOKIE.refresh);
  store.delete(COOKIE.company);
}
