import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Priority } from "@/types";

const priorityTone: Record<Priority, NonNullable<BadgeProps["tone"]>> = {
  alta: "danger",
  media: "warning",
  baixa: "info",
};

const priorityLabel: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

/** Badge de prioridade (Alta/Média/Baixa) conforme paleta do PDF. */
export function PriorityBadge({ priority, size }: { priority: Priority; size?: BadgeProps["size"] }) {
  return (
    <Badge tone={priorityTone[priority]} size={size}>
      {priorityLabel[priority]}
    </Badge>
  );
}

/** Badge de status genérico de negócio (ex.: Ganho). */
export function StatusBadge({
  tone = "neutral",
  size,
  children,
}: {
  tone?: BadgeProps["tone"];
  size?: BadgeProps["size"];
  children: React.ReactNode;
}) {
  return (
    <Badge tone={tone} size={size}>
      {children}
    </Badge>
  );
}
