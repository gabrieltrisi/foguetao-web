import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { MarketplaceView } from "@/components/admin/marketplace-view";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Templates, automações e recursos prontos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Marketplace" description="Templates, automações e recursos prontos." />
      <AdminNav />
      <MarketplaceView />
    </div>
  );
}
