import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SessionsView } from "@/components/admin/sessions-view";

export const metadata: Metadata = {
  title: "Sessões",
  description: "Dispositivos e sessões ativas na sua conta.",
  robots: { index: false, follow: false },
};

export default function SessionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Sessões e dispositivos" description="Gerencie onde sua conta está conectada." />
      <SessionsView />
    </div>
  );
}
