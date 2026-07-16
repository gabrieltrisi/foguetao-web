import type { Metadata } from "next";
import { ListPageLayout } from "@/components/patterns/page-patterns";
import { TagsView } from "@/components/crm/tags-view";
import { NewTagAction } from "@/components/crm/tags-view.actions";

export const metadata: Metadata = {
  title: "Etiquetas",
  description: "Organize seus contatos com etiquetas.",
  robots: { index: false, follow: false },
};

export default function TagsPage() {
  return (
    <ListPageLayout
      title="Etiquetas"
      description="Organize e classifique seus contatos com etiquetas."
      actions={<NewTagAction />}
    >
      <TagsView />
    </ListPageLayout>
  );
}
