"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { PERMISSIONS } from "@/lib/auth/permissions";

/** `permission` opcional: link só aparece se o usuário tiver a permissão. */
const links: { href: string; label: string; permission?: string }[] = [
  { href: "/reports", label: "Relatórios" },
  { href: "/analytics", label: "Analytics" },
  { href: "/funnels", label: "Funis" },
  { href: "/attribution", label: "Atribuição" },
  { href: "/cohorts", label: "Cohorts" },
  { href: "/forecast", label: "Forecast" },
  { href: "/audit", label: "Auditoria", permission: PERMISSIONS.COMPANY_AUDIT_READ },
  { href: "/activity-log", label: "Atividades", permission: PERMISSIONS.COMPANY_AUDIT_READ },
  { href: "/export-center", label: "Exportações" },
];

export function AnalyticsNav() {
  const pathname = usePathname();
  const { can } = useSession();
  const visible = links.filter((l) => !l.permission || can(l.permission));
  return (
    <nav aria-label="Analytics" className="no-scrollbar -mb-px flex items-center gap-1 overflow-x-auto border-b border-line">
      {visible.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
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
