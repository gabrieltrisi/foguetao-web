import type { Metadata } from "next";
import { CampaignForm } from "@/components/marketing/campaign-form";

export const metadata: Metadata = {
  title: "Nova campanha",
  description: "Configure uma nova campanha.",
};

export default function NewCampaignPage() {
  return <CampaignForm />;
}
