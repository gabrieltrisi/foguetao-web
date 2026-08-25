import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

/** Trilha de navegação — último item marcado como página atual. */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Trilha de navegação" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 text-body2 text-ink-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate", isLast ? "font-semibold text-ink" : undefined)}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="size-3.5 shrink-0 text-ink-3" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
