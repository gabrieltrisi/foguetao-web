import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExecutionDetail } from "@/components/automations/execution-detail";
import { executions, getExecutionById } from "@/mocks/automations/executions";

export function generateStaticParams() {
  return executions.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = getExecutionById(id);
  return { title: e ? `Execução · ${e.automationName}` : "Execução", robots: { index: false, follow: false } };
}

export default async function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const execution = getExecutionById(id);
  if (!execution) notFound();
  return <ExecutionDetail execution={execution} />;
}
