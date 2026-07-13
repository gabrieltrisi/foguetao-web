"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

const navBtn =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-line bg-white px-2 text-body2 font-medium text-ink-2 transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/** Paginação numérica (offset). */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}) {
  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-center gap-1", className)}>
      <button
        type="button"
        aria-label="Página anterior"
        className={navBtn}
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-ink-3">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange?.(p)}
            className={cn(
              navBtn,
              p === page && "border-brand bg-brand-soft text-brand-dark hover:bg-brand-soft",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Próxima página"
        className={navBtn}
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}

/** Paginação por cursor (anterior/próxima). */
export function CursorPagination({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  label,
  className,
}: {
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-between gap-3", className)}>
      <button type="button" className={navBtn} disabled={!hasPrev} onClick={onPrev}>
        <ChevronLeft className="size-4" aria-hidden />
        Anterior
      </button>
      {label ? <span className="text-small text-ink-3">{label}</span> : null}
      <button type="button" className={navBtn} disabled={!hasNext} onClick={onNext}>
        Próxima
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
