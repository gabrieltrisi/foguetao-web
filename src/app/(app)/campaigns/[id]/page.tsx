import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/marketing/campaign-detail";
import { campaigns, getCampaignById } from "@/mocks/marketing/campaigns";

export function generateStaticParams() {
  return campaigns.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getCampaignById(id);
  return { title: c ? c.name : "Campanha" };
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = getCampaignById(id);
  if (!campaign) notFound();
  return <CampaignDetail campaign={campaign} />;
}
