/** Tipos do módulo de Marketing & Performance (dados mockados). */
import type { Trend } from "@/types";

export type MarketingChannel =
  | "meta"
  | "google"
  | "tiktok"
  | "instagram"
  | "whatsapp"
  | "email"
  | "organico"
  | "direto"
  | "indicacao"
  | "landing"
  | "afiliado";

export type CampaignStatus = "ativa" | "pausada" | "encerrada" | "rascunho";
export type CampaignObjective = "conversao" | "trafego" | "reconhecimento" | "leads" | "vendas";

export type Campaign = {
  id: string;
  name: string;
  channel: MarketingChannel;
  objective: CampaignObjective;
  status: CampaignStatus;
  budget: number;
  spent: number;
  leads: number;
  cpl: number;
  conversions: number;
  revenue: number;
  roas: number;
  startDate: string;
  endDate: string;
};

export type AdAccountStatus = "connected" | "syncing" | "error" | "disconnected";

export type AdAccount = {
  id: string;
  name: string;
  platform: "meta" | "google" | "tiktok";
  externalId: string;
  status: AdAccountStatus;
  spend: number;
  campaigns: number;
  lastSync: string;
};

/** Linha genérica de anúncio/campanha/conjunto/grupo com métricas. */
export type AdRow = {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
};

export type LandingPageStatus = "published" | "draft" | "archived";

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  status: LandingPageStatus;
  views: number;
  leads: number;
  conversion: number;
  updatedAt: string;
  accent: string;
};

export type Pixel = {
  id: string;
  name: string;
  platform: MarketingChannel;
  status: "active" | "inactive" | "error";
  events: number;
};

export type TrackingEvent = {
  id: string;
  name: string;
  source: string;
  count: number;
  lastFired: string;
};

export type TrackingDomain = { id: string; domain: string; status: "verified" | "pending" };

export type UTMRecord = {
  id: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  createdAt: string;
};

export type LeadSource = {
  id: string;
  name: string;
  channel: MarketingChannel;
  leads: number;
  conversion: number;
  cpl: number;
  revenue: number;
  trend: Trend;
  delta: string;
};

export type MarketingForm = {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  leads: number;
  views: number;
  conversion: number;
  fields: number;
  updatedAt: string;
};

export type AffiliateStatus = "active" | "pending" | "blocked";

export type Affiliate = {
  id: string;
  name: string;
  code: string;
  tier: "Bronze" | "Prata" | "Ouro" | "Diamante";
  clicks: number;
  leads: number;
  sales: number;
  conversion: number;
  revenue: number;
  commission: number;
  status: AffiliateStatus;
};

export type CommissionStatus = "pending" | "approved" | "paid" | "rejected";

export type Commission = {
  id: string;
  affiliate: string;
  saleValue: number;
  amount: number;
  status: CommissionStatus;
  date: string;
};

export type PerformanceMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  hint?: string;
};

export type ChannelPerformance = {
  channel: MarketingChannel;
  spend: number;
  leads: number;
  revenue: number;
  roas: number;
};
