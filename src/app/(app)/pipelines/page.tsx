import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { PipelinesView } from "@/components/crm/pipelines-view";
import { NewPipelineAction } from "@/components/crm/pipelines-view.actions";

export const metadata: Metadata = {
  title: "Pipelines",
  description: "Funis comerciais e suas etapas.",
  robots: { index: false, follow: false },
};

export default function PipelinesPage() {
  return (
    <ListPageLayout
      title="Pipelines"
      description="Gerencie os funis comerciais, suas etapas e o pipeline padrão."
      actions={<NewPipelineAction />}
    >
      <PipelinesView />
    </ListPageLayout>
  );
}
