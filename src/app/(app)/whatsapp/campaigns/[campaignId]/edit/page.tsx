import type { Metadata } from "next";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";

export const metadata: Metadata = {
  title: "Editar campanha",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return <CampaignWizard campaignId={campaignId} />;
}
