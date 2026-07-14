import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { ActivityLogView } from "@/components/analytics/activity-log-view";

export const metadata: Metadata = {
  title: "Atividades",
  description: "Timeline geral de atividades.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Atividades" description="Timeline geral de atividades." />
      <AnalyticsNav />
      <ActivityLogView />
    </div>
  );
}
