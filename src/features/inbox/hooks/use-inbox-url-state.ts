"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildInboxSearch,
  parseInboxSearch,
  type InboxAdvancedFilters,
  type InboxUrlState,
  type InboxView,
} from "@/features/inbox/url-state";

/**
 * Estado da Inbox derivado da URL (F1) — a URL é a FONTE da seleção e dos filtros.
 * Sem estado duplicado com React state. Back/forward do navegador restauram
 * seleção + filtros. Troca de empresa/logout recarregam a rota (limpando o estado).
 */
export function useInboxUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = React.useMemo(
    () => parseInboxSearch(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const navigate = React.useCallback(
    (next: InboxUrlState) => {
      const qs = buildInboxSearch(next);
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );

  const select = React.useCallback(
    (selectedId: string | undefined) => navigate({ ...state, selectedId }),
    [navigate, state],
  );
  const setView = React.useCallback(
    (view: InboxView) => navigate({ ...state, view }),
    [navigate, state],
  );
  const setAdvanced = React.useCallback(
    (advanced: InboxAdvancedFilters) => navigate({ ...state, advanced }),
    [navigate, state],
  );
  const clearAdvanced = React.useCallback(() => navigate({ ...state, advanced: {} }), [navigate, state]);

  return {
    ...state,
    select,
    setView,
    setAdvanced,
    clearAdvanced,
  };
}
