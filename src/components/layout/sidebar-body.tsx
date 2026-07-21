"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarSection } from "@/components/navigation/sidebar-section";
import { navSections } from "@/config/nav";
import { useSession } from "@/providers/session-provider";
import { useLogout } from "@/hooks/auth/use-logout";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Conteúdo interno da sidebar (navegação + rodapé).
 * Compartilhado entre a sidebar desktop e o drawer mobile.
 */
export function SidebarBody({
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  /** Quando presente, exibe o controle de recolher/expandir (desktop). */
  onToggleCollapse?: () => void;
}) {
  const { user } = useSession();
  const logout = useLogout();
  const displayName = user?.name ?? "…";
  const displayEmail = user?.email ?? "";
  const initials = initialsOf(displayName);

  return (
    <div className="flex h-full flex-col">
      {/* Navegação */}
      <nav
        aria-label="Navegação principal"
        className={cn(
          "no-scrollbar flex-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div className="flex flex-col gap-5">
          {navSections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Rodapé */}
      <div className={cn("border-t border-line py-3", collapsed ? "px-2" : "px-3")}>
        {/* Usuário */}
        <div
          className={cn(
            "mt-1 flex items-center gap-2 rounded-lg py-1.5",
            collapsed ? "justify-center px-0" : "px-2",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar initials={initials} size="sm" />
              </TooltipTrigger>
              <TooltipContent side="right">
                {displayName}
                {displayEmail ? ` · ${displayEmail}` : ""}
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Avatar initials={initials} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body2 font-semibold text-ink">{displayName}</p>
                <p className="truncate text-caption text-ink-3">{displayEmail}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => logout.mutate(false)}
                    aria-label="Sair"
                    className="flex size-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <LogOut className="size-4" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Recolher / expandir (apenas desktop) */}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "mt-1 flex h-9 items-center rounded-lg text-body2 font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              collapsed ? "w-full justify-center" : "w-full gap-3 px-3",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-[18px]" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="size-[18px]" aria-hidden />
                <span>Recolher</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

