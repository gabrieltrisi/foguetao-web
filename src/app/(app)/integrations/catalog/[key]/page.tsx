import type { Metadata } from "next";
import { IntegrationDetail } from "@/components/admin/integration-detail";

export const metadata: Metadata = {
  title: "Integração",
  description: "Detalhes da integração.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return <IntegrationDetail catalogKey={key} />;
}
