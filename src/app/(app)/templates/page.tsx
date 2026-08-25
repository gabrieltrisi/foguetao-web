import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { TemplatesView } from "@/components/messaging/templates-view";

export const metadata: Metadata = {
  title: "Templates",
  description: "Mensagens prontas para agilizar o atendimento.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Templates" description="Mensagens prontas para agilizar o atendimento." />
      <CommunicationNav />
      <TemplatesView />
    </div>
  );
}
