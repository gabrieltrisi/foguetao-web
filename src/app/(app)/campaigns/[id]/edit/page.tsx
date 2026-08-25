import type { Metadata } from "next";
import { CampaignForm } from "@/components/marketing/campaign-form";

export const metadata: Metadata = {
  title: "Editar campanha",
  robots: { index: false, follow: false },
};

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignForm campaignId={id} />;
}
