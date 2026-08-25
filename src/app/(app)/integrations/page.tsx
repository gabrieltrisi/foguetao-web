import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { IntegrationsView } from "@/components/admin/integrations-view";

export const metadata: Metadata = {
  title: "Integrações",
  description: "Catálogo de integrações da plataforma.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Integrações"
        description="Catálogo de integrações da plataforma."
      />
      <AdminNav />
      <IntegrationsView />
    </div>
  );
}
