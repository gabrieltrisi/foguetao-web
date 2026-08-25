import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PerformanceView } from "@/components/marketing/performance-view";

export const metadata: Metadata = {
  title: "Performance",
  description: "Indicadores completos de marketing.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Performance" description="Indicadores completos de marketing." />
      <MarketingNav />
      <PerformanceView />
    </div>
  );
}
