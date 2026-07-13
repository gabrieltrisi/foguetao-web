"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Barra de filtros — agrupa controles com quebra de linha e scroll no mobile. */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Filtros"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {children}
    </div>
  );
}

export type ActiveFilter = { id: string; label: string; value: string };

/** Chips dos filtros ativos, com remoção individual e "Limpar tudo". */
export function ActiveFilters({
  filters,
  onRemove,
  onClear,
  className,
}: {
  filters: ActiveFilter[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((f) => (
        <span
          key={f.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2.5 pr-1 text-small text-ink-2"
        >
          <span className="text-ink-3">{f.label}:</span>
          <span className="font-medium text-ink">{f.value}</span>
          <button
            type="button"
            aria-label={`Remover filtro ${f.label}`}
            onClick={() => onRemove?.(f.id)}
            className="flex size-4 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="rounded-md px-1.5 text-small font-medium text-brand transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Limpar tudo
      </button>
    </div>
  );
}

export type SavedView = { id: string; label: string };

/** Seletor de visões salvas. */
export function SavedViewSelector({
  views,
  value,
  onValueChange,
  className,
}: {
  views: SavedView[];
  value: string;
  onValueChange?: (id: string) => void;
  className?: string;
}) {
  const active = views.find((v) => v.id === value) ?? views[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-body2 font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            className,
          )}
        >
          {active?.label}
          <ChevronDown className="size-4 text-ink-3" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Visões salvas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {views.map((v) => (
          <DropdownMenuItem key={v.id} onSelect={() => onValueChange?.(v.id)} className="justify-between">
            {v.label}
            {v.id === value ? <Check className="size-4 text-brand" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
