import { Badge, type BadgeProps } from "@/components/ui/badge";
import { automationStatusLabel, automationStatusTone } from "@/mocks/automations/automations";
import { executionStatusLabel, executionStatusTone } from "@/mocks/automations/executions";
import type { AutomationStatus, ExecutionStatus } from "@/types/automations";

export function AutomationStatusBadge({ status, size }: { status: AutomationStatus; size?: BadgeProps["size"] }) {
  return <Badge tone={automationStatusTone[status]} size={size}>{automationStatusLabel[status]}</Badge>;
}

export function ExecutionStatusBadge({ status, size }: { status: ExecutionStatus; size?: BadgeProps["size"] }) {
  return (
    <Badge tone={executionStatusTone[status]} size={size} className={status === "running" ? "gap-1.5" : undefined}>
      {status === "running" ? <span className="size-1.5 animate-pulse rounded-full bg-info" aria-hidden /> : null}
      {executionStatusLabel[status]}
    </Badge>
  );
}
