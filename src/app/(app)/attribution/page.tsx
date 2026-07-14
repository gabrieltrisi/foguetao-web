import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { AttributionView } from "@/components/analytics/attribution-view";

export const metadata: Metadata = {
  title: "Atribuição",
  description: "Modelos de atribuição de receita.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Atribuição" description="Modelos de atribuição de receita." />
      <AnalyticsNav />
      <AttributionView />
    </div>
  );
}
