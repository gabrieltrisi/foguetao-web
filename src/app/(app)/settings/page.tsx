import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { SettingsView } from "@/components/admin/settings-view";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Administração da plataforma.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Configurações" description="Administração da plataforma." />
      <AdminNav />
      <SettingsView />
    </div>
  );
}
