"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { ApiSession } from "@/types/api/auth";

/** Lista as sessões ativas reais do usuário. */
export function useSessions() {
  return useQuery<ApiSession[]>({
    queryKey: queryKeys.sessions,
    queryFn: ({ signal }) => clientFetch<ApiSession[]>("/api/auth/sessions", { signal }),
  });
}

/** Revoga uma sessão específica (outra que não a atual). */
export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientFetch(`/api/auth/sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
  });
}
