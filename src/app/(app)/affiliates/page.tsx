import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { AffiliatesView } from "@/components/marketing/affiliates-view";

export const metadata: Metadata = {
  title: "Afiliados",
  description: "Parceiros, links e comissões.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Afiliados" description="Parceiros, links e comissões." />
      <MarketingNav />
      <AffiliatesView />
    </div>
  );
}
