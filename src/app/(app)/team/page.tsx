import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { TeamView } from "@/components/admin/team-view";

export const metadata: Metadata = {
  title: "Equipe",
  description: "Usuários, cargos e status da organização.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Equipe" description="Usuários, cargos e status da organização." />
      <AdminNav />
      <TeamView />
    </div>
  );
}
