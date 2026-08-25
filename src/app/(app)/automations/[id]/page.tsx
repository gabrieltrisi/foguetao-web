import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlowEditor } from "@/components/automations/flow-editor";
import { automations, getAutomationById } from "@/mocks/automations/automations";

export function generateStaticParams() {
  return automations.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAutomationById(id);
  return { title: a ? a.name : "Automação" };
}

export default async function AutomationEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automation = getAutomationById(id);
  if (!automation) notFound();
  return <FlowEditor automation={automation} />;
}
