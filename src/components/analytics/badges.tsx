import { Badge, type BadgeProps } from "@/components/ui/badge";
import { reportStatusLabel, reportStatusTone } from "@/mocks/analytics/reports";
import { exportStatusLabel, exportStatusTone } from "@/mocks/analytics/exports";
import type { ExportStatus, ReportStatus } from "@/types/analytics";

export function ReportStatusBadge({ status, size }: { status: ReportStatus; size?: BadgeProps["size"] }) {
  return <Badge tone={reportStatusTone[status]} size={size}>{reportStatusLabel[status]}</Badge>;
}

export function ExportStatusBadge({ status, size }: { status: ExportStatus; size?: BadgeProps["size"] }) {
  return (
    <Badge tone={exportStatusTone[status]} size={size} className={status === "processing" ? "gap-1.5" : undefined}>
      {status === "processing" ? <span className="size-1.5 animate-pulse rounded-full bg-info" aria-hidden /> : null}
      {exportStatusLabel[status]}
    </Badge>
  );
}
