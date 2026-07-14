import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/types/api/error";

/**
 * QueryClient com defaults conservadores:
 *  - sem retry automático em 401/403 (erros de auth/permissão);
 *  - retry único apenas para erros seguros (rede/5xx), evitando tempestades;
 *  - staleTime moderado; sem refetch agressivo ao focar a janela.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error) && (error.isUnauthorized || error.isForbidden)) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
