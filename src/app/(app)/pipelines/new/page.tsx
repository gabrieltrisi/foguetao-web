import type { Metadata } from "next";
import { PipelineForm } from "@/components/crm/pipeline-form";

export const metadata: Metadata = {
  title: "Novo pipeline",
  description: "Crie um funil comercial.",
  robots: { index: false, follow: false },
};

export default function NewPipelinePage() {
  return <PipelineForm />;
}
