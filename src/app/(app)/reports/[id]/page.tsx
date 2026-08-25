import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportDetail } from "@/components/analytics/report-detail";
import { reports, getReportById } from "@/mocks/analytics/reports";

export function generateStaticParams() {
  return reports.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getReportById(id);
  return { title: r ? r.name : "Relatório" };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getReportById(id);
  if (!report) notFound();
  return <ReportDetail report={report} />;
}
