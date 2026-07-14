import type { Metadata } from "next";
import { BillingView } from "@/components/admin/billing-view";

export const metadata: Metadata = {
  title: "Billing",
  description: "Cobranças, faturas e pagamento.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BillingView />;
}
