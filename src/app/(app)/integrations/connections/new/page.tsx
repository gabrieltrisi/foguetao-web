import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectionForm } from "@/components/admin/connection-form";

export const metadata: Metadata = {
  title: "Nova conexão",
  description: "Configuração estrutural de integração.",
  robots: { index: false, follow: false },
};

/** `useSearchParams` exige Suspense na fronteira do client component. */
export default function Page() {
  return (
    <Suspense>
      <ConnectionForm />
    </Suspense>
  );
}
