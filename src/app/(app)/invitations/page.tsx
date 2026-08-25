import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { InvitationsView } from "@/components/admin/invitations-view";

export const metadata: Metadata = {
  title: "Convites",
  description: "Convites enviados e pendentes.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Convites" description="Convites enviados e pendentes." />
      <AdminNav />
      <InvitationsView />
    </div>
  );
}
