import type { Metadata } from "next";
import { ReportBuilder } from "@/components/analytics/report-builder";

export const metadata: Metadata = {
  title: "Novo relatório",
  description: "Construa um relatório personalizado.",
  robots: { index: false, follow: false },
};

export default function NewReportPage() {
  return <ReportBuilder />;
}
