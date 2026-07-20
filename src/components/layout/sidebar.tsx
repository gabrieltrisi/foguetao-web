"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo, LogoSymbol } from "@/components/brand/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarBody } from "@/components/layout/sidebar-body";
import { useSidebar } from "@/hooks/use-sidebar";

/** Sidebar desktop — expandida (~256px) ou recolhida (apenas ícones). */
export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Cabeçalho / logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-line",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          <Link
            href="/dashboard"
            aria-label="Foguetão — Visão geral"
            className="flex items-center rounded-md"
          >
            {collapsed ? (
              <LogoSymbol className="size-9" />
            ) : (
              <>
                {/* Claro: logo colorido; escuro: versão branca (troca por CSS). */}
                <Logo variant="sidebar" className="h-9 w-auto dark:hidden" />
                <Logo variant="mono" white className="hidden h-9 w-auto dark:block" />
              </>
            )}
          </Link>
        </div>

        <SidebarBody collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>
    </TooltipProvider>
  );
}
