import type { Metadata } from "next";
import { DomainsView } from "@/components/admin/domains-view";

export const metadata: Metadata = {
  title: "Domínios",
  description: "Domínios personalizados, SSL e DNS.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DomainsView />;
}
