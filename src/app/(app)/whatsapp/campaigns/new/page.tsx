import type { Metadata } from "next";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";

export const metadata: Metadata = {
  title: "Nova campanha",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CampaignWizard />;
}
