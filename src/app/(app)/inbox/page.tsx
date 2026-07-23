import type { Metadata } from "next";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { Inbox } from "@/components/messaging/inbox/inbox";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Atenda as conversas de mensageria em tempo real.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <CommunicationNav />
      <Inbox />
    </div>
  );
}
