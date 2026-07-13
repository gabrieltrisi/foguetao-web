import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { InboxView } from "@/components/messaging/inbox-view";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Visão operacional dos atendimentos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Inbox" description="Visão operacional dos atendimentos." />
      <CommunicationNav />
      <InboxView />
    </div>
  );
}
