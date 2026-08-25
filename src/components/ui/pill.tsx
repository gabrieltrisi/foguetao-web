import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Chip selecionável (ex.: filtros de segmento). Para status use StatusBadge. */
const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ className, active = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center whitespace-nowrap rounded-full border px-3 text-small font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        active
          ? "border-brand bg-brand-soft text-brand-dark"
          : "border-line bg-white text-ink-2 hover:bg-surface",
        className,
      )}
      {...props}
    />
  ),
);
Pill.displayName = "Pill";

export { Pill };
