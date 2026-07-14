"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import { isApiError } from "@/types/api/error";
import { can as canFn, canAny as canAnyFn, canAll as canAllFn } from "@/lib/auth/permissions";
import { queryKeys } from "@/lib/query/keys";
import type { SessionBootstrap } from "@/types/api/session";
import type { CompanySummary, CompanyRole, MembershipStatus } from "@/types/api/company";
import type { ApiUser } from "@/types/api/auth";

export type SessionStatus =
  | "loading"
  | "ready"
  | "expired"
  | "no-companies"
  | "company-inaccessible"
  | "unavailable"
  | "error";

interface SessionContextValue {
  status: SessionStatus;
  user: ApiUser | null;
  companies: CompanySummary[];
  activeCompanyId: string | null;
  activeCompany: CompanySummary | null;
  role: CompanyRole | null;
  membershipStatus: MembershipStatus | null;
  isOwner: boolean;
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
  switchCompany: (companyId: string) => Promise<void>;
  isSwitchingCompany: boolean;
  refetch: () => void;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch } = useQuery<SessionBootstrap>({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => clientFetch<SessionBootstrap>("/api/session", { signal }),
    retry: (count, err) => (isApiError(err) && err.isUnauthorized ? false : count < 1),
  });

  const switchMutation = useMutation({
    mutationFn: (companyId: string) =>
      clientFetch("/api/companies/active", { method: "POST", body: { companyId } }),
    onSuccess: async () => {
      // Empresa ativa mudou: recarrega bootstrap e invalida dados de domínio.
      await queryClient.invalidateQueries();
    },
  });

  const value = React.useMemo<SessionContextValue>(() => {
    const status: SessionStatus = (() => {
      if (isLoading) return "loading";
      if (error) {
        if (isApiError(error) && error.isUnauthorized) return "expired";
        if (isApiError(error) && error.isUnavailable) return "unavailable";
        return "error";
      }
      if (!data) return "loading";
      if (data.companies.length === 0) return "no-companies";
      if (!data.context) return "company-inaccessible";
      return "ready";
    })();

    const permissions = data?.context?.permissions ?? [];
    const activeCompany =
      data?.companies.find((c) => c.id === data.activeCompanyId) ?? null;

    return {
      status,
      user: data?.user ?? null,
      companies: data?.companies ?? [],
      activeCompanyId: data?.activeCompanyId ?? null,
      activeCompany,
      role: data?.context?.role ?? null,
      membershipStatus: data?.context?.membershipStatus ?? null,
      isOwner: data?.context?.isOwner ?? false,
      permissions,
      can: (p) => canFn(permissions, p),
      canAny: (p) => canAnyFn(permissions, p),
      canAll: (p) => canAllFn(permissions, p),
      switchCompany: async (companyId) => {
        await switchMutation.mutateAsync(companyId);
      },
      isSwitchingCompany: switchMutation.isPending,
      refetch,
    };
  }, [data, error, isLoading, refetch, switchMutation]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession deve ser usado dentro de <SessionProvider>");
  return ctx;
}
