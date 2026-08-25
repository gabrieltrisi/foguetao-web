"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { CreateMenu } from "@/components/layout/create-menu";
import { Notifications } from "@/components/layout/notifications";
import { NotificationBell, isNotificationCenterEnabled } from "@/features/notifications";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { getRouteTitle } from "@/lib/route-title";
import { siteConfig } from "@/config/site";

export function AppHeader() {
  const pathname = usePathname();
  const { toggleCollapsed, setMobileOpen } = useSidebar();

  const currentTitle = getRouteTitle(pathname);

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

      {/* Ações à direita */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:block">
          <CompanySwitcher />
        </div>
        <CreateMenu compact />
        <ThemeToggle />
        {/* Notification Center (F7.7): sino real quando a flag está ligada; caso
            contrário mantém o placeholder atual (rollout progressivo). */}
        {isNotificationCenterEnabled() ? <NotificationBell /> : <Notifications />}
        <UserMenu />
      </div>
    </header>
  );
}
