"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavItem } from "@/config/nav";

/**
 * Item de navegação da sidebar.
 * - expandido: ícone + rótulo (+ badge opcional)
 * - recolhido: apenas ícone, rótulo via tooltip
 * - ativo: fundo Brand Soft + texto Brand
 */
export function SidebarItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const baseClass = cn(
    "group relative flex h-10 items-center rounded-lg text-body2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    collapsed ? "w-10 justify-center" : "w-full gap-3 px-3",
    active
      ? "bg-brand-soft text-brand"
      : "text-ink-2 hover:bg-surface hover:text-ink",
    item.disabled && "cursor-default text-ink-3 hover:bg-transparent hover:text-ink-3",
  );

  const content = (
    <>
      {active && !collapsed ? (
        <span
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand"
          aria-hidden
        />
      ) : null}
      <Icon className={cn("size-[18px] shrink-0", active ? "text-brand" : undefined)} aria-hidden />
      {!collapsed ? (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <Badge tone="neutral" size="sm">
              {item.badge}
            </Badge>
          ) : null}
        </>
      ) : null}
    </>
  );

  const inner = item.disabled ? (
    <span
      className={baseClass}
      aria-disabled="true"
      aria-current={active ? "page" : undefined}
    >
      {content}
    </span>
  ) : (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={baseClass}
    >
      {content}
    </Link>
  );

  // Tooltip apenas quando recolhido (mostra rótulo e badge).
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          {item.badge ? ` · ${item.badge}` : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}
