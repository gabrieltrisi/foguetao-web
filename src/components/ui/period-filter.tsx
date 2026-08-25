"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { PeriodOption, PeriodValue } from "@/types";

/**
 * Filtro de período segmentado (Hoje · 7 dias · 30 dias · Este mês · Personalizado).
 * No mobile permite scroll horizontal sem gerar overflow na página.
 */
export function PeriodFilter({
  options,
  value,
  onValueChange,
  className,
}: {
  options: PeriodOption[];
  value: PeriodValue;
  onValueChange?: (value: PeriodValue) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Período"
      className={cn(
        "no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-line bg-white p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange?.(option.value)}
            className={cn(
              "h-8 shrink-0 whitespace-nowrap rounded-md px-3 text-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active ? "bg-brand-soft text-brand-dark" : "text-ink-2 hover:bg-surface",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
