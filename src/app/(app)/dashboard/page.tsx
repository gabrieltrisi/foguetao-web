import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Visão geral",
  description: "Acompanhe os principais resultados da sua operação.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
