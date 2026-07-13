import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AutomationNav } from "@/components/automations/automation-nav";
import { WebhooksView } from "@/components/automations/webhooks-view";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Endpoints de webhook e chamadas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Webhooks" description="Endpoints de webhook e chamadas." />
      <AutomationNav />
      <WebhooksView />
    </div>
  );
}
