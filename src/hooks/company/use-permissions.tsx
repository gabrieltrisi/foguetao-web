"use client";

import * as React from "react";
import { useSession } from "@/providers/session-provider";

/** Helpers de permissão vinculados à empresa ativa. */
export function usePermissions() {
  const { can, canAny, canAll, permissions, role, isOwner } = useSession();
  return { can, canAny, canAll, permissions, role, isOwner };
}

/**
 * Renderiza `children` somente quando o usuário tem a permissão exigida.
 * Use para esconder ações/itens de menu sem permissão (não é barreira de
 * segurança — o backend é a fonte de verdade).
 */
export function Can({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can, canAny, canAll } = useSession();
  let allowed = true;
  if (permission) allowed = can(permission);
  else if (anyOf) allowed = canAny(anyOf);
  else if (allOf) allowed = canAll(allOf);
  return <>{allowed ? children : fallback}</>;
}
