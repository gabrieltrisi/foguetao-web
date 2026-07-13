import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { LeadSourcesView } from "@/components/marketing/lead-sources-view";

export const metadata: Metadata = {
  title: "Origens de lead",
  description: "De onde vêm seus leads.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Origens de lead" description="De onde vêm seus leads." />
      <MarketingNav />
      <LeadSourcesView />
    </div>
  );
}
