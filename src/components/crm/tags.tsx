import { cn } from "@/lib/utils";

/** Lista de tags neutras (chips). */
export function TagList({
  tags,
  max,
  className,
}: {
  tags: string[];
  max?: number;
  className?: string;
}) {
  const shown = max ? tags.slice(0, max) : tags;
  const rest = max ? tags.length - shown.length : 0;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {shown.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full border border-line bg-surface px-2 py-0.5 text-caption font-medium text-ink-2"
        >
          {t}
        </span>
      ))}
      {rest > 0 ? <span className="text-caption text-ink-3">+{rest}</span> : null}
    </span>
  );
}
