"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { ApiUser } from "@/types/api/auth";

/** Confirma o e-mail via token. O BFF define os cookies (auto-login). */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      clientFetch<{ user: ApiUser }>("/api/auth/verify-email", {
        method: "POST",
        body: { token },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
}

/** Reenvia o e-mail de confirmação. */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      clientFetch<{ message: string }>("/api/auth/resend-verification", {
        method: "POST",
        body: { email },
      }),
  });
}
