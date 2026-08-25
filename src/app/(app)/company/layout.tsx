import { PageHeader } from "@/components/ui/page-header";
import { CompanyNav } from "@/components/admin/admin-nav";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Empresa" description="Dados, identidade, plano e limites da sua organização." />
      <CompanyNav />
      {children}
    </div>
  );
}
