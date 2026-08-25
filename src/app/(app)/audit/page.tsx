import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsNav } from "@/components/analytics/analytics-nav";
import { AuditView } from "@/components/analytics/audit-view";

export const metadata: Metadata = {
  title: "Auditoria",
  description: "Registro de ações e eventos de segurança.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Auditoria" description="Registro de ações e eventos de segurança." />
      <AnalyticsNav />
      <AuditView />
    </div>
  );
}
