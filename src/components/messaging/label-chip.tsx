import { cn } from "@/lib/utils";
import type { LabelColor } from "@/types/messaging";

export const labelColorClasses: Record<LabelColor, { dot: string; chip: string; solid: string }> = {
  brand: { dot: "bg-brand", chip: "bg-brand-soft text-brand-dark", solid: "bg-brand" },
  info: { dot: "bg-info", chip: "bg-info/10 text-info", solid: "bg-info" },
  success: { dot: "bg-success", chip: "bg-success/10 text-success", solid: "bg-success" },
  warning: { dot: "bg-warning", chip: "bg-warning/10 text-warning", solid: "bg-warning" },
  danger: { dot: "bg-danger", chip: "bg-danger/10 text-danger", solid: "bg-danger" },
  neutral: { dot: "bg-ink-3", chip: "bg-line/60 text-ink-2", solid: "bg-ink-3" },
};

/** Chip de etiqueta colorida. */
export function LabelChip({
  name,
  color,
  className,
}: {
  name: string;
  color: LabelColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium",
        labelColorClasses[color].chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", labelColorClasses[color].dot)} aria-hidden />
      {name}
    </span>
  );
}
