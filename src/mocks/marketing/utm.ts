/**
 * MOCK DE PREVIEW - O historico de UTMs NAO existe no backend.
 *
 * Auditado na Sprint 1.4: nao ha model no Prisma, controller nem endpoint
 * para nenhum dominio de Marketing. As permissoes (campaigns.*, ads.*,
 * affiliates.*) existem no catalogo RBAC, mas sao ORFAS - permissao nao e
 * contrato. Estes dados sao apenas demonstracao e NADA e persistido.
 */
import type { UTMRecord } from "@/types/marketing";

export const utmSources = ["google", "facebook", "instagram", "tiktok", "youtube", "email", "whatsapp", "afiliado"];
export const utmMediums = ["cpc", "social", "email", "referral", "organic", "display", "influencer"];

export const utmHistory: UTMRecord[] = [
  {
    id: "utm-1",
    url: "https://foguetao.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=black-week",
    source: "google",
    medium: "cpc",
    campaign: "black-week",
    createdAt: "há 2 h",
  },
  {
    id: "utm-2",
    url: "https://foguetao.com.br/trial?utm_source=instagram&utm_medium=social&utm_campaign=reels-julho",
    source: "instagram",
    medium: "social",
    campaign: "reels-julho",
    createdAt: "ontem",
  },
  {
    id: "utm-3",
    url: "https://foguetao.com.br/webinar?utm_source=email&utm_medium=email&utm_campaign=nutricao",
    source: "email",
    medium: "email",
    campaign: "nutricao",
    createdAt: "há 3 dias",
  },
];
