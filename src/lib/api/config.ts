import { env } from "@/lib/env";

/** Prefixo global + versionamento do backend (foguetao-api). */
export const API_PREFIX = "/api/v1";

/** Header de contexto de empresa esperado pelo backend. */
export const COMPANY_ID_HEADER = "x-company-id";

/** Monta a URL absoluta de um endpoint do backend. */
export function backendUrl(path: string): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${API_PREFIX}${clean}`;
}

/** Endpoints do backend usados nesta sprint (auth + empresas). */
export const endpoints = {
  register: "/auth/register",
  login: "/auth/login",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  logoutAll: "/auth/logout-all",
  me: "/auth/me",
  sessions: "/auth/sessions",
  session: (id: string) => `/auth/sessions/${id}`,
  companies: "/companies",
  companyContext: (id: string) => `/companies/${id}/context`,
  companyMembers: (id: string) => `/companies/${id}/members`,
} as const;
