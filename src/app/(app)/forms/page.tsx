import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { FormsView } from "@/components/marketing/forms-view";

export const metadata: Metadata = {
  title: "Formulários",
  description: "Formulários de captação e conversão.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Formulários" description="Formulários de captação e conversão." />
      <MarketingNav />
      <FormsView />
    </div>
  );
}
