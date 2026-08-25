import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { LandingPagesView } from "@/components/marketing/landing-pages-view";

export const metadata: Metadata = {
  title: "Landing Pages",
  description: "Catálogo de páginas de captura.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Landing Pages" description="Catálogo de páginas de captura." />
      <MarketingNav />
      <LandingPagesView />
    </div>
  );
}
