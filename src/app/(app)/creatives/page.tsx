import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CreativesView } from "@/features/creatives/components/creatives-view";

export const metadata: Metadata = {
  title: "Criativos",
  description: "Gere imagens por IA a partir de um prompt.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Criativos" description="Gere imagens por IA a partir de um prompt." />
      <CreativesView />
    </div>
  );
}
