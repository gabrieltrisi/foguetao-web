import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { LabelsView } from "@/components/messaging/labels-view";

export const metadata: Metadata = {
  title: "Etiquetas",
  description: "Organize suas conversas com etiquetas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Etiquetas" description="Organize suas conversas com etiquetas." />
      <CommunicationNav />
      <LabelsView />
    </div>
  );
}
