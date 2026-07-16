import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type { CompanyRole } from "@/types/api/company";
import type { ApiPermissionCatalog, ApiRole } from "@/types/api/rbac";

type Tone = NonNullable<BadgeProps["tone"]>;

/**
 * Tom visual por papel (só apresentação; o nome/descrição vêm do backend).
 * Reusa o `roleLabel` de `lib/company/team` para o rótulo — este módulo cuida
 * do que é específico da matriz de RBAC.
 */
export const roleTone: Record<CompanyRole, Tone> = {
  OWNER: "danger",
  ADMIN: "brand",
  MANAGER: "info",
  MARKETING: "info",
  COMMERCIAL: "info",
  SUPPORT: "neutral",
  FINANCIAL: "warning",
  AFFILIATE: "neutral",
  VIEWER: "neutral",
};

/**
 * Verifica se um papel concede uma permissão. A fonte é SEMPRE a lista que o
 * backend enviou para aquele papel — o front nunca recalcula a matriz. Um Set
 * torna a checagem O(1) ao montar a grade.
 */
export function makePermissionChecker(role: ApiRole): (permissionKey: string) => boolean {
  const granted = new Set(role.permissions);
  return (permissionKey: string) => granted.has(permissionKey);
}

/** Quantas permissões de um grupo o papel concede (para o contador por domínio). */
export function grantedCountInGroup(
  role: ApiRole,
  permissionKeys: readonly string[],
): number {
  const granted = new Set(role.permissions);
  return permissionKeys.reduce((n, key) => (granted.has(key) ? n + 1 : n), 0);
}

/** Filtra o catálogo por busca textual (chave ou nome) e por domínio. */
export function filterCatalog(
  catalog: ApiPermissionCatalog,
  opts: { search?: string; domain?: string },
): ApiPermissionCatalog["groups"] {
  const term = opts.search?.trim().toLowerCase();
  return catalog.groups
    .filter((g) => !opts.domain || g.key === opts.domain)
    .map((g) => ({
      ...g,
      permissions: term
        ? g.permissions.filter(
            (p) => p.key.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
          )
        : g.permissions,
    }))
    .filter((g) => g.permissions.length > 0);
}

/**
 * Diferença entre dois papéis (para a comparação opcional): permissões que só
 * `a` tem, só `b` tem, e em comum.
 */
export function diffRoles(
  a: ApiRole,
  b: ApiRole,
): { onlyA: string[]; onlyB: string[]; shared: string[] } {
  const setA = new Set(a.permissions);
  const setB = new Set(b.permissions);
  const onlyA = a.permissions.filter((p) => !setB.has(p));
  const onlyB = b.permissions.filter((p) => !setA.has(p));
  const shared = a.permissions.filter((p) => setB.has(p));
  return { onlyA, onlyB, shared };
}

/**
 * Verifica que o espelho local de hierarquia bate com o que o backend enviou.
 * Usado em teste: se divergir, o teste falha em vez de mascarar. O backend é a
 * autoridade final — este espelho só evita oferecer o que ele recusaria.
 */
export function hierarchyMatchesBackend(
  roles: readonly ApiRole[],
  localCanManage: (actor: CompanyRole, target: CompanyRole) => boolean,
): boolean {
  const all = roles.map((r) => r.role);
  return roles.every((r) => {
    const backendManage = new Set(r.canManage);
    return all
      .filter((t) => t !== r.role)
      .every((target) => localCanManage(r.role, target) === backendManage.has(target));
  });
}

export function messageForRbacError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para ver papéis e permissões.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "COMPANY_ACCESS_DENIED":
        return "Você não tem acesso a esta empresa.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível carregar papéis e permissões.";
}
