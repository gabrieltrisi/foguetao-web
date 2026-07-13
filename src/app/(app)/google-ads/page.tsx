import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { GoogleAdsView } from "@/components/marketing/google-ads-view";

export const metadata: Metadata = {
  title: "Google Ads",
  description: "Contas, campanhas e métricas do Google.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Google Ads" description="Contas, campanhas e métricas do Google." />
      <MarketingNav />
      <GoogleAdsView />
    </div>
  );
}
