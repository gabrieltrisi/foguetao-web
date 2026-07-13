"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/conversations", label: "Conversas" },
  { href: "/inbox", label: "Inbox" },
  { href: "/whatsapp", label: "WhatsApp" },
  { href: "/templates", label: "Templates" },
  { href: "/labels", label: "Etiquetas" },
  { href: "/queues", label: "Filas" },
  { href: "/ai-assistant", label: "IA" },
];

export function CommunicationNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Comunicação"
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
