import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SessionsLive } from "@/components/auth/sessions-live";

export const metadata: Metadata = {
  title: "Sessões",
  description: "Dispositivos e sessões ativas na sua conta.",
  robots: { index: false, follow: false },
};

export default function SessionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Sessões e dispositivos" description="Gerencie onde sua conta está conectada." />
      <SessionsLive />
    </div>
  );
}
