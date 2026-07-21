"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { ApiUser } from "@/types/api/auth";

interface RegisterResult {
  /** true → precisa confirmar e-mail; false → já autenticado (auto-login). */
  pendingVerification: boolean;
  email?: string;
  message?: string;
  user?: ApiUser;
}

/**
 * Cadastro: POST /api/auth/register. Se a confirmação de e-mail estiver ligada,
 * retorna `pendingVerification: true` (tela "confirme seu e-mail"). Se estiver
 * desligada, o BFF já definiu os cookies (auto-login) e volta
 * `pendingVerification: false` → segue direto pro app.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      clientFetch<RegisterResult>("/api/auth/register", { method: "POST", body: input }),
    onSuccess: async (data) => {
      if (!data.pendingVerification) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      }
    },
  });
}
