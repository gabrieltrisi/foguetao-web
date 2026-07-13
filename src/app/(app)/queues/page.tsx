import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { QueuesView } from "@/components/messaging/queues-view";

export const metadata: Metadata = {
  title: "Filas",
  description: "Distribuição de atendimentos por fila.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Filas" description="Distribuição de atendimentos por fila." />
      <CommunicationNav />
      <QueuesView />
    </div>
  );
}
