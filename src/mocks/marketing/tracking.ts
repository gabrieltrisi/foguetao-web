/**
 * MOCK DE PREVIEW - O rastreamento NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { Pixel, TrackingDomain, TrackingEvent } from "@/types/marketing";

export const pixels: Pixel[] = [
  { id: "px-1", name: "Meta Pixel", platform: "meta", status: "active", events: 12840 },
  { id: "px-2", name: "Google Tag", platform: "google", status: "active", events: 9620 },
  { id: "px-3", name: "TikTok Pixel", platform: "tiktok", status: "inactive", events: 0 },
  { id: "px-4", name: "GA4", platform: "google", status: "error", events: 431 },
];

export const trackingEvents: TrackingEvent[] = [
  { id: "ev-1", name: "PageView", source: "Site", count: 48200, lastFired: "há 3 s" },
  { id: "ev-2", name: "Lead", source: "Formulário", count: 1284, lastFired: "há 41 s" },
  { id: "ev-3", name: "AddToCart", source: "Checkout", count: 862, lastFired: "há 2 min" },
  { id: "ev-4", name: "Purchase", source: "Checkout", count: 96, lastFired: "há 8 min" },
  { id: "ev-5", name: "InitiateCheckout", source: "Checkout", count: 214, lastFired: "há 12 min" },
];

export const trackingDomains: TrackingDomain[] = [
  { id: "dm-1", domain: "foguetao.com.br", status: "verified" },
  { id: "dm-2", domain: "app.foguetao.com.br", status: "verified" },
  { id: "dm-3", domain: "lp.foguetao.com.br", status: "pending" },
];
