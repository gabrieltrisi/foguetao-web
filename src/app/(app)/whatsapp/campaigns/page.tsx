import type { Metadata } from "next";
import { CampaignsList } from "@/components/campaigns/campaigns-list";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Campanhas de WhatsApp agendadas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CampaignsList />;
}
