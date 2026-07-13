import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageDetail } from "@/components/marketing/landing-page-detail";
import { landingPages, getLandingPageById } from "@/mocks/marketing/landing-pages";

export function generateStaticParams() {
  return landingPages.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = getLandingPageById(id);
  return { title: l ? l.name : "Landing Page" };
}

export default async function LandingPageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getLandingPageById(id);
  if (!page) notFound();
  return <LandingPageDetail page={page} />;
}
