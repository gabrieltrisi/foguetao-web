import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estado vazio reutilizável — ícone da marca em destaque (anéis suaves,
 * sem ilustração genérica), título, descrição e até duas ações.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  /** Versão compacta (dentro de cards menores). */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white text-center",
        compact ? "px-5 py-10" : "px-6 py-16",
        className,
      )}
    >
      {/* Ícone com anéis concêntricos suaves da marca */}
      <div className="relative flex items-center justify-center" aria-hidden>
        <span className="absolute size-20 rounded-full bg-brand-soft/50" />
        <span className="absolute size-14 rounded-full bg-brand-soft" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-sm">
          <Icon className="size-6" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-h3 font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-body2 text-ink-2">{description}</p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
