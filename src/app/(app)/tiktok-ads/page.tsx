import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { TikTokAdsView } from "@/components/marketing/tiktok-ads-view";

export const metadata: Metadata = {
  title: "TikTok Ads",
  description: "Contas e campanhas do TikTok.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="TikTok Ads" description="Contas e campanhas do TikTok." />
      <MarketingNav />
      <TikTokAdsView />
    </div>
  );
}
