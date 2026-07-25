"use client";

import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignTimeline } from "@/hooks/campaigns/use-campaigns";
import { formatDateTime, timelineEventLabel } from "@/lib/campaigns/display";

/** Timeline operacional (lifecycle) da campanha — só eventos relevantes, sem PII. */
export function CampaignTimeline({ campaignId, timezone }: { campaignId: string; timezone?: string }) {
  const q = useCampaignTimeline(campaignId);

  if (q.isError) {
    return <ErrorState title="Não foi possível carregar a timeline" onRetry={() => q.refetch()} />;
  }
  if (q.isLoading && !q.data) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  const events = q.data ?? [];
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Sem eventos ainda"
        description="Os marcos da campanha (agendamento, início, pausa, conclusão) aparecem aqui."
      />
    );
  }

  return (
    <ol className="relative flex flex-col gap-5 border-l border-line pl-6">
      {events.map((e, i) => (
        <li key={`${e.event}-${e.timestamp}-${i}`} className="relative">
          <span
            className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-brand"
            aria-hidden
          />
          <p className="text-body2 font-medium text-ink">{timelineEventLabel(e.event)}</p>
          <p className="text-caption text-ink-3">{formatDateTime(e.timestamp, timezone)}</p>
        </li>
      ))}
    </ol>
  );
}
