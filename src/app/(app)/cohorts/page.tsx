import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { CohortsView } from "@/components/analytics/cohorts-view";

export const metadata: Metadata = {
  title: "Cohorts",
  description: "Retenção e recompra por safra.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Cohorts" description="Retenção e recompra por safra." />
      <AnalyticsNav />
      <CohortsView />
    </div>
  );
}
