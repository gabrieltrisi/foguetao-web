import type { BadgeProps } from "@/components/ui/badge";
import { isApiError } from "@/types/api/error";
import type { CompanyPlan, CompanyStatus } from "@/types/api/company";

type Tone = NonNullable<BadgeProps["tone"]>;

/** CompanyStatus real do backend. Não há `TRIAL` (o mock inventava um). */
export const companyStatusMeta: Record<CompanyStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Ativa", tone: "success" },
  SUSPENDED: { label: "Suspensa", tone: "danger" },
  DISABLED: { label: "Desativada", tone: "neutral" },
};

/** CompanyPlan real. O plano NÃO é editável por nenhuma rota. */
export const companyPlanMeta: Record<CompanyPlan, { label: string; tone: Tone }> = {
  FREE: { label: "Free", tone: "neutral" },
  STARTER: { label: "Starter", tone: "info" },
  PRO: { label: "Pro", tone: "brand" },
  ENTERPRISE: { label: "Enterprise", tone: "success" },
};

/**
 * Opções de fuso. O backend aceita QUALQUER timezone IANA (valida via Intl),
 * então esta lista é conveniência de UI, não uma allowlist — o valor atual da
 * empresa é sempre incluído, mesmo se estiver fora dela.
 */
const BASE_TIMEZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Fortaleza",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Bogota",
  "America/Buenos_Aires",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "UTC",
];

export const TIMEZONE_OPTIONS = BASE_TIMEZONES.map((tz) => ({ value: tz, label: tz }));

/** Locales BCP 47. O backend valida via Intl.getCanonicalLocales. */
export const LOCALE_OPTIONS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "pt-PT", label: "Português (Portugal)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

/** ISO 4217. O backend só valida o formato (3 letras), sem allowlist. */
export const CURRENCY_OPTIONS = [
  { value: "BRL", label: "Real (BRL)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

/** Garante que o valor atual apareça no seletor mesmo fora da lista base. */
export function withCurrent(
  options: { value: string; label: string }[],
  current: string | undefined,
): { value: string; label: string }[] {
  if (!current || options.some((o) => o.value === current)) return options;
  return [{ value: current, label: current }, ...options];
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Erros reais dos fluxos de empresa. */
export function messageForCompanyError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "COMPANY_NOT_FOUND":
        return "Empresa não encontrada.";
      case "COMPANY_INACTIVE":
        return "Esta empresa está suspensa ou desativada.";
      case "COMPANY_ACCESS_DENIED":
        return "Você não tem acesso a esta empresa.";
      case "COMPANY_CONTEXT_REQUIRED":
        return "Nenhuma empresa ativa selecionada.";
      case "COMPANY_SLUG_UNAVAILABLE":
        return "Este identificador já está em uso.";
      case "INSUFFICIENT_PERMISSION":
      case "INSUFFICIENT_ROLE":
        return "Você não tem permissão para esta ação.";
      case "VALIDATION_ERROR":
        return "Verifique os campos e tente novamente.";
      default:
        if (error.isForbidden) return "Você não tem permissão para esta ação.";
        if (error.isUnavailable) return "Servidor indisponível. Tente novamente em instantes.";
        return error.message;
    }
  }
  return "Não foi possível concluir a ação.";
}
