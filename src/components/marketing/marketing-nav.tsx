"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/campaigns", label: "Campanhas" },
  { href: "/performance", label: "Performance" },
  { href: "/meta-ads", label: "Meta Ads" },
  { href: "/google-ads", label: "Google Ads" },
  { href: "/tiktok-ads", label: "TikTok Ads" },
  { href: "/landing-pages", label: "Landing Pages" },
  { href: "/forms", label: "Formulários" },
  { href: "/tracking", label: "Rastreamento" },
  { href: "/utm-builder", label: "UTM Builder" },
  { href: "/lead-sources", label: "Origens" },
  { href: "/affiliates", label: "Afiliados" },
];

export function MarketingNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Marketing"
      className="no-scrollbar -mb-px flex items-center gap-1 overflow-x-auto border-b border-line"
    >
      {links.map((l) => {
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
