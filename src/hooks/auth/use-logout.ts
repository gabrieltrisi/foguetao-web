"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";

/** Logout: revoga no backend, limpa o cache de queries e volta ao /login. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, boolean>({
    mutationFn: (all: boolean) =>
      clientFetch(all ? "/api/auth/logout-all" : "/api/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}
