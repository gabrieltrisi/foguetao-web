import type { Metadata } from "next";
import { CompanyGeneral } from "@/components/admin/company-general";

export const metadata: Metadata = {
  title: "Dados da empresa",
  description: "Nome, documento, contato e localização.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CompanyGeneral />;
}
