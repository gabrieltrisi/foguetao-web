"use client";

import { Badge } from "@/components/ui/badge";
import { campaignStatusMetaOf } from "@/lib/campaigns/display";

export function CampaignStatusBadge({ status }: { status: string }) {
  const meta = campaignStatusMetaOf(status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
