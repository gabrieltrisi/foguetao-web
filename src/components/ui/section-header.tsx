import { cn } from "@/lib/utils";

/** Cabeçalho de seção dentro de um card — título (H3) + descrição + ação à direita. */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-h3 font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-small text-ink-2">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
