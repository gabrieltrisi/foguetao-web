import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { PermissionsView } from "@/components/admin/permissions-view";

export const metadata: Metadata = {
  title: "Permissões",
  description: "Matriz de permissões por papel (somente leitura).",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Permissões" description="Matriz de permissões por papel." />
      <AdminNav />
      {/* useSearchParams (?role=) exige Suspense na fronteira do client. */}
      <Suspense>
        <PermissionsView />
      </Suspense>
    </div>
  );
}
