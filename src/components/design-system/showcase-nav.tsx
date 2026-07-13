"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/design-system", label: "Visão geral" },
  { href: "/design-system/table", label: "Tabelas & dados" },
  { href: "/design-system/forms", label: "Formulários" },
  { href: "/design-system/overlays", label: "Overlays" },
  { href: "/design-system/patterns", label: "Padrões & negócio" },
];

export function ShowcaseNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Seções do design system"
      className="no-scrollbar -mb-px flex items-center gap-1 overflow-x-auto border-b border-line"
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-body2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active
                ? "border-brand text-brand"
                : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
