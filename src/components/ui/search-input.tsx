import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Atalho exibido à direita (ex.: "Ctrl K"). */
  shortcut?: string;
  containerClassName?: string;
}

/** Campo de busca com ícone e atalho opcional. */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, shortcut, "aria-label": ariaLabel, ...props }, ref) => (
    <div className={cn("relative flex items-center", containerClassName)}>
      <Search className="pointer-events-none absolute left-3 size-4 text-ink-3" aria-hidden />
      <input
        ref={ref}
        type="search"
        aria-label={ariaLabel ?? "Buscar"}
        className={cn(
          "h-9 w-full rounded-lg border border-line bg-white pl-9 pr-14 text-body2 text-ink shadow-sm transition-colors",
          "placeholder:text-ink-3",
          "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15 focus-visible:outline-none",
          "[&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        {...props}
      />
      {shortcut ? (
        <kbd className="pointer-events-none absolute right-2.5 hidden items-center rounded border border-line bg-surface px-1.5 py-0.5 text-micro font-medium text-ink-3 sm:inline-flex">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  ),
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
