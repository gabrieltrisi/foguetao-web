"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = { value: T; label: string; icon?: React.ReactNode };

/** Controle segmentado (tab-like compacto). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = "md",
  className,
  ariaLabel = "Opções",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-line bg-white p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange?.(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              size === "sm" ? "h-7 px-2.5 text-small" : "h-8 px-3 text-body2",
              active ? "bg-brand-soft text-brand-dark" : "text-ink-2 hover:bg-surface",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
