import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ExecutionsView } from "@/components/automations/executions-view";
import { automations, getAutomationById } from "@/mocks/automations/automations";

export function generateStaticParams() {
  return automations.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAutomationById(id);
  return { title: a ? `Execuções · ${a.name}` : "Execuções", robots: { index: false, follow: false } };
}

export default async function AutomationExecutionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automation = getAutomationById(id);
  if (!automation) notFound();
  return (
    <div className="flex flex-col gap-5">
      <Link href={`/automations/${automation.id}`} className="inline-flex w-fit items-center gap-1 rounded-md text-body2 font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <ChevronLeft className="size-4" aria-hidden />
        {automation.name}
      </Link>
      <PageHeader title="Execuções" description={`Histórico de execuções de "${automation.name}".`} />
      <ExecutionsView automationId={automation.id} />
    </div>
  );
}
