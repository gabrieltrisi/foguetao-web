import type { Metadata } from "next";
import { AutomationNav } from "@/components/automations/automation-nav";
import { AIAutomationPrompt } from "@/components/automations/ai-automation-prompt";

export const metadata: Metadata = {
  title: "Assistente de IA",
  description: "Crie automações descrevendo em linguagem natural.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <AutomationNav />
      <AIAutomationPrompt />
    </div>
  );
}
