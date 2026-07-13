import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { UTMBuilderView } from "@/components/marketing/utm-builder-view";

export const metadata: Metadata = {
  title: "UTM Builder",
  description: "Monte links rastreáveis com UTM.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="UTM Builder" description="Monte links rastreáveis com UTM." />
      <MarketingNav />
      <UTMBuilderView />
    </div>
  );
}
