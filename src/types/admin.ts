/** Tipos do módulo de Administração da Plataforma (Sprint 0.9). Tudo mockado. */

export type CompanyStatus = "active" | "trial" | "suspended";

export interface Company {
  id: string;
  name: string;
  legalName: string;
  document: string;
  phone: string;
  email: string;
  site: string;
  timezone: string;
  language: string;
  currency: string;
  segment: string;
  status: CompanyStatus;
  plan: string;
}

export interface CompanyKpi {
  label: string;
  value: string;
}

export interface BrandSettings {
  companyName: string;
  logoLabel: string;
  faviconLabel: string;
  primary: string;
  secondary: string;
  domain: string;
  email: string;
}

export type DomainStatus = "verified" | "pending" | "failed";
export type DnsStatus = "ok" | "pending" | "error";

export interface Domain {
  id: string;
  domain: string;
  status: DomainStatus;
  ssl: boolean;
  dns: DnsStatus;
  primary: boolean;
  addedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  priceLabel: string;
  period: string;
  description: string;
  popular?: boolean;
  current?: boolean;
  highlights: string[];
}

export interface PlanFeatureRow {
  label: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

export type InvoiceStatus = "paid" | "pending" | "failed";

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  plan: string;
}

export interface PaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
}

export interface UsageLimit {
  key: string;
  label: string;
  used: number;
  total: number;
  unit?: string;
}

/* Membros e convites agora vêm do contrato real: @/types/api/company. */

export interface Role {
  id: string;
  name: string;
  description: string;
  members: number;
  tone: "brand" | "info" | "success" | "warning" | "danger" | "neutral";
  system?: boolean;
}

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "manage";

export interface PermissionModule {
  key: string;
  label: string;
  actions: Record<PermissionAction, boolean>;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
}

export type SecurityLevel = "info" | "warning" | "danger";

export interface SecurityAlert {
  id: string;
  level: SecurityLevel;
  title: string;
  description: string;
  time: string;
}

export type ApiKeyStatus = "active" | "expired" | "revoked";

export interface ApiKey {
  id: string;
  name: string;
  scope: string;
  masked: string;
  createdAt: string;
  lastUsed: string;
  expiresAt: string;
  status: ApiKeyStatus;
}

/* Os tipos de integração agora vêm do contrato real: @/types/api/integrations. */

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  author: string;
  downloads: number;
  rating: number;
  priceLabel: string;
  accent: string;
  installed?: boolean;
}

export interface OnboardingOption {
  value: string;
  label: string;
  icon: string;
}
