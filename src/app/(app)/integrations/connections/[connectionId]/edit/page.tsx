import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectionForm } from "@/components/admin/connection-form";

export const metadata: Metadata = {
  title: "Editar conexão",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params;
  return (
    <Suspense>
      <ConnectionForm connectionId={connectionId} />
    </Suspense>
  );
}
