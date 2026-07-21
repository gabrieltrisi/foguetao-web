"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";

interface RegisterResult {
  pendingVerification: boolean;
  email: string;
  message: string;
}

/**
 * Cadastro real: POST /api/auth/register. O backend cria a conta e envia um
 * e-mail de confirmação — NÃO há login aqui. O acesso é liberado após o
 * usuário confirmar o e-mail (fluxo em /verify-email).
 */
export function useRegister() {
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      clientFetch<RegisterResult>("/api/auth/register", { method: "POST", body: input }),
  });
}
