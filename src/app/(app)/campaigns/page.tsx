import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
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
      {/* Sprint MVP 1: MarketingNav ocultado — expunha módulos não-MVP
          (Meta/Google/TikTok Ads, Landing Pages, etc.) fora do escopo. */}
      <CampaignsView />
    </div>
  );
}
