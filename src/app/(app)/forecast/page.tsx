import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { ForecastView } from "@/components/analytics/forecast-view";

export const metadata: Metadata = {
  title: "Forecast",
  description: "Previsão de receita e metas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Forecast" description="Previsão de receita e metas." />
      <AnalyticsNav />
      <ForecastView />
    </div>
  );
}
