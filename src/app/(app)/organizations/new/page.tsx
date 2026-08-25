import type { Metadata } from "next";
import { OrganizationForm } from "@/components/crm/organization-form";

export const metadata: Metadata = {
  title: "Nova organização",
  description: "Cadastre uma nova organização.",
  robots: { index: false, follow: false },
};

export default function NewOrganizationPage() {
  return <OrganizationForm />;
}
