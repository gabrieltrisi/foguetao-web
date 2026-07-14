import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { TeamLive } from "@/components/admin/team-live";

export const metadata: Metadata = {
  title: "Equipe",
  description: "Membros da empresa ativa (dados reais).",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Equipe" description="Membros da empresa ativa." />
      <AdminNav />
      <TeamLive />
    </div>
  );
}
