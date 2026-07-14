import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { SecurityView } from "@/components/admin/security-view";

export const metadata: Metadata = {
  title: "Segurança",
  description: "Sessões, dispositivos, 2FA e alertas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Segurança" description="Sessões, dispositivos, 2FA e alertas." />
      <AdminNav />
      <SecurityView />
    </div>
  );
}
