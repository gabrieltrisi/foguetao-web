import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { TrackingView } from "@/components/marketing/tracking-view";

export const metadata: Metadata = {
  title: "Rastreamento",
  description: "Pixels, eventos e domínios.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Rastreamento" description="Pixels, eventos e domínios." />
      <MarketingNav />
      <TrackingView />
    </div>
  );
}
