import type { Metadata } from "next";
import { FlowEditor } from "@/components/automations/flow-editor";
import { blankAutomation } from "@/mocks/automations/automations";

export const metadata: Metadata = {
  title: "Nova automação",
  description: "Crie uma nova automação no editor visual.",
  robots: { index: false, follow: false },
};

export default function NewAutomationPage() {
  return <FlowEditor automation={blankAutomation} />;
}
