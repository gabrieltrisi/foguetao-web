"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Bell className="size-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-6 text-center">
          <p className="text-body2 font-medium text-ink">Você está em dia.</p>
          <p className="mt-1 text-caption text-ink-3">
            Nenhuma notificação nova por enquanto.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
