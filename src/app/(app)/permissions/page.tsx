import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { PermissionsView } from "@/components/admin/permissions-view";

export const metadata: Metadata = {
  title: "Permissões",
  description: "Controle de acesso por módulo.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Permissões" description="Controle de acesso por módulo." />
      <AdminNav />
      <PermissionsView />
    </div>
  );
}
