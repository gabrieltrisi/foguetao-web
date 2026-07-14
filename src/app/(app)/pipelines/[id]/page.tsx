import type { Metadata } from "next";
import { PipelineDetail } from "@/components/crm/pipeline-detail";

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Etapas e configuração do pipeline.",
  robots: { index: false, follow: false },
};

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PipelineDetail id={id} />;
}
