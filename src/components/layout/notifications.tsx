"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { id: "n1", text: "Vertex Farma respondeu sua proposta.", time: "há 8 min" },
  { id: "n2", text: "Tarefa “Follow-up Zenit Corp” vence amanhã.", time: "há 1 h" },
  { id: "n3", text: "Campanha Black Week atingiu 80% do orçamento.", time: "há 3 h" },
];

export function Notifications() {
  const unread = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notificações${unread ? ` (${unread} não lidas)` : ""}`}
          className="relative flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Bell className="size-5" aria-hidden />
          {unread > 0 ? (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-white"
              aria-hidden
            />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
            <span className="text-body2 text-ink">{n.text}</span>
            <span className="text-caption text-ink-3">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
