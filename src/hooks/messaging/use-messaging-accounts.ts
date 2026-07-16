"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging/client";
import { queryKeys, messagingInvalidation } from "@/lib/query/keys";
import { useSession } from "@/providers/session-provider";

/** Contas de messaging (ligadas a uma IntegrationConnection MESSAGING). */
export function useMessagingAccounts() {
  const { activeCompanyId, can } = useSession();
  return useQuery({
    queryKey: [...queryKeys.messaging.accounts(), activeCompanyId],
    queryFn: () => messagingApi.listAccounts(),
    enabled: Boolean(activeCompanyId) && can("messaging.accounts.read"),
  });
}

function useAccountsInvalidation() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: messagingInvalidation.allAccounts });
}

export function useConnectAccount() {
  const invalidate = useAccountsInvalidation();
  return useMutation({
    mutationFn: (id: string) => messagingApi.connectAccount(id),
    onSuccess: invalidate,
  });
}

export function useDisconnectAccount() {
  const invalidate = useAccountsInvalidation();
  return useMutation({
    mutationFn: (id: string) => messagingApi.disconnectAccount(id),
    onSuccess: invalidate,
  });
}

export function useTestAccount() {
  const invalidate = useAccountsInvalidation();
  return useMutation({
    mutationFn: (id: string) => messagingApi.testAccount(id),
    onSuccess: invalidate,
  });
}
