import type { Metadata } from "next";
import { CampaignDetail } from "@/components/marketing/campaign-detail";

export const metadata: Metadata = {
  title: "Campanha",
  description: "Detalhe da campanha.",
};

/**
 * Os dados reais vêm do BFF no cliente (a sessão é httpOnly), então não há
 * `generateStaticParams` sobre mock nem `notFound()` local: o 404 é o real do
 * backend e a tela o trata.
 */
export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignDetail campaignId={id} />;
}
