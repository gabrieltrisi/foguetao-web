import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { ConnectionsView } from "@/components/admin/connections-view";

export const metadata: Metadata = {
  title: "Conexões",
  description: "Conexões de integração da empresa.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Conexões"
        description="Conexões de integração configuradas nesta empresa."
      />
      <AdminNav />
      <ConnectionsView />
    </div>
  );
}
