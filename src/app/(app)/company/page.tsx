import type { Metadata } from "next";
import { CompanyGeneral } from "@/components/admin/company-general";

export const metadata: Metadata = {
  title: "Empresa",
  description: "Dados gerais da empresa.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CompanyGeneral />;
}
