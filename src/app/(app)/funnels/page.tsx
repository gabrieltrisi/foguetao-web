import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { FunnelsView } from "@/components/analytics/funnels-view";

export const metadata: Metadata = {
  title: "Funis",
  description: "Análise de funis e taxas de conversão.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Funis" description="Análise de funis e taxas de conversão." />
      <AnalyticsNav />
      <FunnelsView />
    </div>
  );
}
