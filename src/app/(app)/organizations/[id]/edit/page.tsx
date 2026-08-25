import type { Metadata } from "next";
import { OrganizationForm } from "@/components/crm/organization-form";

export const metadata: Metadata = {
  title: "Editar organização",
  robots: { index: false, follow: false },
};

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationForm organizationId={id} />;
}
