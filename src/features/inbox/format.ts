/**
 * Apresentação central da Inbox (F1) — canal, preview e status. PURO. Evita
 * `switch` de canal/status espalhado nos componentes e `new Date()` disperso.
 * Reusa os metadados de status já existentes em `lib/messaging/display`.
 */
import { statusMeta } from "@/lib/messaging/display";

export { statusMeta };

/** Rótulo acessível do canal (nunca depende só de cor). `key` → ícone no componente. */
export function channelPresentation(channel: string | undefined): { key: string; label: string } {
  switch (channel) {
    case "WHATSAPP":
      return { key: "whatsapp", label: "WhatsApp" };
    case "INSTAGRAM":
      return { key: "instagram", label: "Instagram" };
    case "MESSENGER":
      return { key: "messenger", label: "Messenger" };
    case "TELEGRAM":
      return { key: "telegram", label: "Telegram" };
    case "EMAIL":
      return { key: "email", label: "E-mail" };
    case "SMS":
      return { key: "sms", label: "SMS" };
    default:
      return { key: "unknown", label: "Canal" };
  }
}

/** Fallback de preview por TIPO de mensagem (quando não há texto). Nunca inventa conteúdo. */
const TYPE_FALLBACK: Record<string, string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  AUDIO: "Áudio",
  DOCUMENT: "Documento",
  LOCATION: "Localização",
  CONTACT: "Contato",
  STICKER: "Figurinha",
  TEMPLATE: "Modelo",
  SYSTEM: "Mensagem do sistema",
};

/**
 * Texto de preview da lista a partir do `lastMessagePreview` PÚBLICO. Usa o texto
 * sanitizado; sem texto, cai no rótulo do tipo; tipo desconhecido → genérico.
 * NUNCA recebe nota interna (o backend só projeta mensagens públicas na prévia).
 */
export function previewText(
  preview: { preview: string | null; type: string } | null | undefined,
): string | null {
  if (!preview) return null;
  if (preview.preview && preview.preview.trim().length > 0) return preview.preview;
  return TYPE_FALLBACK[preview.type] ?? "Mensagem não suportada";
}

/**
 * Formata o instante da última atividade de forma relativa/curta (F1, §27):
 * hoje → hora; ontem → "Ontem"; semana → dia; mais antigo → data curta. `now` é
 * parâmetro (testável). Locale pt-BR.
 */
export function formatConversationTime(iso: string | null, now: Date): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (dayDiff <= 0) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (dayDiff === 1) return "Ontem";
  if (dayDiff < 7) return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Título completo (tooltip) do instante. */
export function fullTimestamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("pt-BR");
}
