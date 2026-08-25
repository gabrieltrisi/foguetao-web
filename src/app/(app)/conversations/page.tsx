import type { Metadata } from "next";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { ConversationsLayout } from "@/components/messaging/conversations-layout";

export const metadata: Metadata = {
  title: "Conversas",
  description: "Central de mensagens de todos os canais.",
};

export default function ConversationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <CommunicationNav />
      <ConversationsLayout />
    </div>
  );
}
