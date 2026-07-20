"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SearchInput } from "@/components/ui/search-input";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { CreateMenu } from "@/components/layout/create-menu";
import { Notifications } from "@/components/layout/notifications";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { getRouteTitle } from "@/lib/route-title";
import { siteConfig } from "@/config/site";

export function AppHeader() {
  const pathname = usePathname();
  const { toggleCollapsed, setMobileOpen } = useSidebar();
  const searchRef = React.useRef<HTMLInputElement>(null);

  const currentTitle = getRouteTitle(pathname);

  // Atalho Ctrl/Cmd + K foca a busca global.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:px-4">
      {/* Menu — abre o drawer no mobile */}
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setMobileOpen(true)}
        className="flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* Menu — recolhe/expande a sidebar no desktop */}
      <button
        type="button"
        aria-label="Recolher ou expandir menu"
        onClick={toggleCollapsed}
        className="hidden size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:flex"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* Breadcrumb */}
      <Breadcrumb
        className="hidden md:block"
        items={[{ label: siteConfig.name, href: "/dashboard" }, { label: currentTitle }]}
      />

      {/* Busca global */}
      <div className="mx-2 hidden min-w-0 flex-1 justify-center md:flex">
        <SearchInput
          ref={searchRef}
          shortcut="Ctrl K"
          placeholder="Buscar contatos, oportunidades e conversas…"
          aria-label="Buscar contatos, oportunidades e conversas"
          containerClassName="w-full max-w-md"
        />
      </div>

      {/* Ações à direita */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:block">
          <CompanySwitcher />
        </div>
        <CreateMenu compact />
        <ThemeToggle />
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}
