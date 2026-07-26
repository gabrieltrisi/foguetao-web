import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { InboxShell } from "@/features/inbox/components/shell/inbox-shell";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Atenda as conversas de mensageria em tempo real.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <CommunicationNav />
      {/* useSearchParams (seleção/filtros por URL) exige limite de Suspense. */}
      <Suspense fallback={<div className="h-[calc(100dvh-11rem)] rounded-xl border border-line bg-white" />}>
        <InboxShell />
      </Suspense>
    </div>
  );
}
