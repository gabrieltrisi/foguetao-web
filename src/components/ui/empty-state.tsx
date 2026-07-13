import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Estado vazio — ícone em destaque, título, descrição e ação opcional. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-h3 font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-body2 text-ink-2">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
