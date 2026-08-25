import "server-only";
import type { TokenPair } from "@/types/api/auth";
import { refreshRequest } from "./service";

/**
 * Deduplicação do refresh: múltiplas requisições que recebem 401 ao mesmo
 * tempo compartilham UMA única chamada a /auth/refresh (single-flight),
 * chaveada pelo refresh token atual. Evita corrida de rotação de tokens.
 */
const inFlight = new Map<string, Promise<TokenPair>>();

export function dedupedRefresh(
  refreshToken: string,
  refreshFn: (rt: string) => Promise<TokenPair> = refreshRequest,
): Promise<TokenPair> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = refreshFn(refreshToken).finally(() => {
    inFlight.delete(refreshToken);
  });
  inFlight.set(refreshToken, promise);
  return promise;
}

/** Apenas para testes: limpa o mapa de refresh em andamento. */
export function __resetRefreshDedup(): void {
  inFlight.clear();
}
