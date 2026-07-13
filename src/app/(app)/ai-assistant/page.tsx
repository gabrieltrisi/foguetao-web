import type { Metadata } from "next";
import { CommunicationNav } from "@/components/messaging/communication-nav";
import { AIAssistantView } from "@/components/messaging/ai-assistant-view";

export const metadata: Metadata = {
  title: "Assistente de IA",
  description: "Sugestões e insights para seus atendimentos.",
  robots: { index: false, follow: false },
};

export default function AIAssistantPage() {
  return (
    <div className="flex flex-col gap-5">
      <CommunicationNav />
      <AIAssistantView />
    </div>
  );
}
