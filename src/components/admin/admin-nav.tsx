"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/settings", label: "Geral" },
  { href: "/company", label: "Empresa" },
  { href: "/team", label: "Equipe" },
  { href: "/roles", label: "Papéis" },
  { href: "/permissions", label: "Permissões" },
  { href: "/invitations", label: "Convites" },
  { href: "/security", label: "Segurança" },
  { href: "/api-keys", label: "API Keys" },
  { href: "/integrations", label: "Integrações" },
  { href: "/marketplace", label: "Marketplace" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administração" className="no-scrollbar -mb-px flex items-center gap-1 overflow-x-auto border-b border-line">
      {links.map((l) => {
        const active =
          l.href === "/settings"
            ? pathname === "/settings"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
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
