import type { Metadata } from "next";
import { ConnectionDetail } from "@/components/admin/connection-detail";

export const metadata: Metadata = {
  title: "Conexão",
  description: "Detalhes da conexão de integração.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params;
  return <ConnectionDetail id={connectionId} />;
}
