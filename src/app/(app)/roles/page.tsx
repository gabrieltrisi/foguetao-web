import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { RolesView } from "@/components/admin/roles-view";

export const metadata: Metadata = {
  title: "Papéis",
  description: "Perfis de acesso e responsabilidades.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Papéis" description="Perfis de acesso e responsabilidades." />
      <AdminNav />
      <RolesView />
    </div>
  );
}
