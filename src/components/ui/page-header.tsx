import { cn } from "@/lib/utils";

/**
 * Cabeçalho de página — título (H1) + descrição + área de ações.
 * Reorganiza em coluna no mobile (página 10).
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-h1 font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-body text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
