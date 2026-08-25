"use client";

import { cn } from "@/lib/utils";

/**
 * Badge de contagem do sino. Mostra o número (99+ acima de 99). Não renderiza
 * nada quando a contagem é zero. Puramente apresentacional.
 */
export function NotificationBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      aria-label={`${count} não lidas`}
      className={cn(
        "absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white",
        className,
      )}
    >
      {label}
    </span>
  );
}
