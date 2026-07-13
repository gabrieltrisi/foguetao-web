import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MetaAdsView } from "@/components/marketing/meta-ads-view";

export const metadata: Metadata = {
  title: "Meta Ads",
  description: "Contas, campanhas e métricas da Meta.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Meta Ads" description="Contas, campanhas e métricas da Meta." />
      <MarketingNav />
      <MetaAdsView />
    </div>
  );
}
