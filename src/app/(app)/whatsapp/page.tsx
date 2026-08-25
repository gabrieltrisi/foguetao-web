import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { WhatsAppView } from "@/components/messaging/whatsapp-view";

export const metadata: Metadata = {
  title: "WhatsApp",
  description: "Gerencie os números conectados.",
};

export default function WhatsAppPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="WhatsApp" description="Conecte e gerencie seus números de WhatsApp." />
      <CommunicationNav />
      <WhatsAppView />
    </div>
  );
}
