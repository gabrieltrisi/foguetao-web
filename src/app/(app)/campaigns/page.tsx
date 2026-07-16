import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CampaignsView, NewCampaignButton } from "@/components/marketing/campaigns-view";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Crie e acompanhe campanhas de marketing.",
};

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Campanhas"
        description="Crie e acompanhe suas campanhas de marketing."
        actions={<NewCampaignButton />}
      />
      <MarketingNav />
      <CampaignsView />
    </div>
  );
}
