import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CommissionsView } from "@/components/marketing/commissions-view";

export const metadata: Metadata = {
  title: "Comissões",
  description: "Histórico de comissões dos afiliados.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Comissões" description="Histórico de comissões dos afiliados." />
      <MarketingNav />
      <CommissionsView />
    </div>
  );
}
