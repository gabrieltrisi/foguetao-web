"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { ApiUser } from "@/types/api/auth";

/**
 * Cadastro real: POST /api/auth/register. O BFF cria a conta e já faz o
 * auto-login (define os cookies httpOnly), então a sessão nasce autenticada.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      clientFetch<{ user: ApiUser }>("/api/auth/register", { method: "POST", body: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}
