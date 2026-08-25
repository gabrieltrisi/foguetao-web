import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { ApiKeysView } from "@/components/admin/api-keys-view";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Chaves de integração da conta.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="API Keys" description="Chaves de integração da conta." />
      <AdminNav />
      <ApiKeysView />
    </div>
  );
}
