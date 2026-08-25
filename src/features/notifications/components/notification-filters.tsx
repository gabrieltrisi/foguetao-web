"use client";

import { cn } from "@/lib/utils";
import type { NotificationStatusFilter } from "@/types/api/notifications";
import { STATUS_FILTERS } from "../constants";

/** Filtros de status (Todas / Não lidas / Lidas / Arquivadas). */
export function NotificationFilters({
  value,
  onChange,
}: {
  value: NotificationStatusFilter;
  onChange: (next: NotificationStatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar notificações">
      {STATUS_FILTERS.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={cn(
              "rounded-full px-2.5 py-1 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active
                ? "bg-brand text-white"
                : "bg-surface text-ink-2 hover:bg-line/60 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
