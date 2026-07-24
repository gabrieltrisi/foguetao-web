import type { Metadata } from "next";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";

export const metadata: Metadata = {
  title: "Campanha",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return <CampaignDetail id={campaignId} />;
}
