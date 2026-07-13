"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarItem } from "@/components/navigation/sidebar-item";
import type { NavSection } from "@/config/nav";

/** Grupo de itens da sidebar com título (oculto quando recolhida). */
export function SidebarSection({
  section,
  collapsed,
  onNavigate,
}: {
  section: NavSection;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      <p
        className={cn(
          "px-3 text-caption font-semibold uppercase tracking-wide text-ink-3",
          collapsed ? "sr-only" : "mb-1",
        )}
      >
        {section.title}
      </p>
      <ul className={cn("flex flex-col gap-1", collapsed && "items-center")}>
        {section.items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className={collapsed ? undefined : "w-full"}>
              <SidebarItem
                item={item}
                active={active && !item.disabled}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
