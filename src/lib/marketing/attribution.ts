import { isApiError } from "@/types/api/error";
import type { ApiAttribution, ApiLeadSourceKind } from "@/types/api/marketing";

/**
 * Apresentação de origens e atribuição.
 *
 * O contrato NÃO tem métrica de mídia. `contactCount` é contagem de contatos
 * distintos do CRM — não é lead gerado por anúncio, não vira CPL, receita nem
 * ROAS. Nada aqui calcula conversão.
 */

/* ---------- Rótulos ---------- */

/** Rótulo do BALDE (kind). O NOME da origem é da empresa e vem do contrato. */
export const leadSourceKindLabel: Record<ApiLeadSourceKind, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  WEBSITE: "Site",
  LANDING_PAGE: "Landing page",
  FORM: "Formulário",
  REFERRAL: "Indicação",
  AFFILIATE: "Afiliado",
  ORGANIC: "Orgânico",
  DIRECT: "Direto",
  IMPORT: "Importação",
  OTHER: "Outros",
};

export function kindLabel(kind: string): string {
  return leadSourceKindLabel[kind as ApiLeadSourceKind] ?? kind;
}

export const LEAD_SOURCE_KINDS = Object.keys(leadSourceKindLabel) as ApiLeadSourceKind[];

export const touchpointOriginLabel: Record<string, string> = {
  MANUAL: "Registro manual",
  API: "Captura automática",
};

/* ---------- UTM ---------- */

/** Os 5 parâmetros reais. Nada de invenção fora do padrão. */
export const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

/** Normaliza um valor de UTM: minúsculo, sem espaço, sem caractere exótico. */
export function slugifyUtm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "");
}

export interface UtmValues {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

/**
 * Monta a URL final.
 *
 * Preserva a query que já existe na URL base (o `?utm_x` é ACRESCENTADO, não
 * substitui) e mantém o fragmento no fim, onde ele tem que ficar. Devolve
 * string vazia se a base não for uma URL http(s) válida — a UI mostra o erro
 * em vez de exibir um link quebrado.
 */
export function buildUtmUrl(base: string, values: UtmValues): string {
  const raw = base.trim();
  if (!raw) return "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }
  if (!["http:", "https:"].includes(url.protocol)) return "";

  for (const key of UTM_KEYS) {
    const slug = slugifyUtm(values[key]);
    if (slug) url.searchParams.set(`utm_${key}`, slug);
    else url.searchParams.delete(`utm_${key}`);
  }
  return url.toString();
}

/** Só as UTMs preenchidas — para exibir sem poluir com campos vazios. */
export function filledUtms(a: ApiAttribution): { label: string; value: string }[] {
  return [
    { label: "utm_source", value: a.utmSource },
    { label: "utm_medium", value: a.utmMedium },
    { label: "utm_campaign", value: a.utmCampaign },
    { label: "utm_term", value: a.utmTerm },
    { label: "utm_content", value: a.utmContent },
  ].filter((u): u is { label: string; value: string } => Boolean(u.value));
}

export function hasUtms(a: ApiAttribution): boolean {
  return filledUtms(a).length > 0;
}

/* ---------- Formatação ---------- */

export function formatCapturedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Erros ---------- */

/** Mensagens dos ErrorCodes REAIS de origem/atribuição. */
export function messageForAttributionError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "LEAD_SOURCE_NOT_FOUND":
        return "Origem não encontrada.";
      case "LEAD_SOURCE_NAME_ALREADY_EXISTS":
        return "Já existe uma origem com este nome.";
      case "LEAD_SOURCE_INACTIVE":
        return "Esta origem está inativa — reative-a para usá-la.";
      case "LEAD_SOURCE_IN_USE":
        return error.message || "Origem já usada em atribuições — desative-a em vez de excluir.";
      case "LEAD_SOURCE_SYSTEM_READONLY":
        return "Origem padrão não pode ser excluída — desative-a.";
      case "ATTRIBUTION_NOT_FOUND":
        return "Atribuição não encontrada.";
      case "ATTRIBUTION_URL_INVALID":
        return error.message || "URL inválida: use um endereço http(s) completo.";
      case "CAMPAIGN_ARCHIVED":
        return "Campanha arquivada não aceita novos vínculos.";
      case "CAMPAIGN_NOT_FOUND":
        return "Campanha não encontrada.";
      case "CONTACT_NOT_FOUND":
        return "Contato não encontrado.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "VALIDATION_ERROR":
        return error.message || "Dados inválidos.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
