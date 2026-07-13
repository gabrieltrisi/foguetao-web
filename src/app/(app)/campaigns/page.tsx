import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CampaignsView } from "@/components/marketing/campaigns-view";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Crie e acompanhe campanhas de marketing.",
};

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Campanhas"
        description="Crie e acompanhe suas campanhas de marketing."
        actions={
          <Button asChild size="sm">
            <Link href="/campaigns/new">
              <Plus />
              Nova campanha
            </Link>
          </Button>
        }
      />
      <MarketingNav />
      <CampaignsView />
    </div>
  );
}
