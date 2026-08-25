"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";

/** Solicita o e-mail de recuperação de senha (resposta genérica do backend). */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      clientFetch<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      }),
  });
}

/** Redefine a senha a partir do token recebido por e-mail. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      clientFetch<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: input,
      }),
  });
}
