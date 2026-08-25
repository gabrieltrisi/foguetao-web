import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { ExportCenterView } from "@/components/analytics/export-center-view";

export const metadata: Metadata = {
  title: "Exportações",
  description: "Central de exportações de relatórios.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Exportações" description="Central de exportações de relatórios." />
      <AnalyticsNav />
      <ExportCenterView />
    </div>
  );
}
