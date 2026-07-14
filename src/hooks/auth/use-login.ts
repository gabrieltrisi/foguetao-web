"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { ApiUser } from "@/types/api/auth";

/** Login real: POST /api/auth/login (BFF define os cookies httpOnly). */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      clientFetch<{ user: ApiUser }>("/api/auth/login", { method: "POST", body: input }),
    onSuccess: async () => {
      // Sessão nova: invalida o bootstrap para recarregar usuário/empresas.
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}
