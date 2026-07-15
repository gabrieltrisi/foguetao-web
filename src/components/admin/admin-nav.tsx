"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";

const links: { href: string; label: string; permission?: string }[] = [
  { href: "/settings", label: "Geral" },
  { href: "/company", label: "Empresa", permission: PERMISSIONS.COMPANY_READ },
  { href: "/team", label: "Equipe", permission: PERMISSIONS.COMPANY_MEMBERS_READ },
  { href: "/roles", label: "Papéis", permission: PERMISSIONS.COMPANY_MEMBERS_READ },
  { href: "/permissions", label: "Permissões", permission: PERMISSIONS.COMPANY_MEMBERS_READ },
  { href: "/invitations", label: "Convites", permission: PERMISSIONS.COMPANY_MEMBERS_INVITE },
  { href: "/security", label: "Segurança" },
  { href: "/api-keys", label: "API Keys" },
  {
    href: "/integrations",
    label: "Integrações",
    permission: PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ,
  },
  {
    href: "/integrations/connections",
    label: "Conexões",
    permission: PERMISSIONS.INTEGRATIONS_CONNECTIONS_READ,
  },
  { href: "/marketplace", label: "Marketplace" },
];

/** Um link cobre a rota atual (exato ou como prefixo de segmento). */
function matches(href: string, pathname: string): boolean {
  // "/settings" é o hub: só casa exato, senão cobriria toda a administração.
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const { can } = useSession();
  const visible = links.filter((l) => !l.permission || can(l.permission));

  // Só a rota MAIS específica fica ativa: sem isto, "/integrations/connections"
  // acenderia também a aba "/integrations".
  const activeHref = visible
    .filter((l) => matches(l.href, pathname))
    .reduce<string | null>((best, l) => (best && best.length >= l.href.length ? best : l.href), null);

  return (
    <nav aria-label="Administração" className="no-scrollbar -mb-px flex items-center gap-1 overflow-x-auto border-b border-line">
      {visible.map((l) => {
        const active = l.href === activeHref;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-body2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active ? "border-brand text-brand" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

const companyLinks = [
  { href: "/company/general", label: "Geral" },
  { href: "/company/branding", label: "Branding" },
  { href: "/company/domains", label: "Domínios" },
  { href: "/company/plans", label: "Plano" },
  { href: "/company/billing", label: "Billing" },
  { href: "/company/limits", label: "Limites" },
];

export function CompanyNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Empresa" className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-1">
      {companyLinks.map((l) => {
        const active = pathname === l.href || (l.href === "/company/general" && pathname === "/company");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-body2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active ? "bg-white text-brand shadow-sm" : "text-ink-2 hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
