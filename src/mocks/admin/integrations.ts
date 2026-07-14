import type { Integration, IntegrationStatusKey } from "@/types/admin";
import type { BadgeProps } from "@/components/ui/badge";

export const integrations: Integration[] = [
  { id: "meta", name: "Meta", category: "Anúncios", description: "Campanhas de Facebook e Instagram Ads.", status: "connected", lastSync: "Há 8 min", icon: "megaphone" },
  { id: "google-ads", name: "Google Ads", category: "Anúncios", description: "Importa custos e conversões de campanhas.", status: "connected", lastSync: "Há 22 min", icon: "badge-dollar" },
  { id: "google-analytics", name: "Google Analytics", category: "Analytics", description: "Sessões, origens e eventos do site.", status: "connected", lastSync: "Há 1 h", icon: "chart" },
  { id: "evolution", name: "Evolution API", category: "Mensageria", description: "WhatsApp não-oficial via Evolution.", status: "connected", lastSync: "Há 3 min", icon: "message" },
  { id: "whatsapp-cloud", name: "WhatsApp Cloud", category: "Mensageria", description: "API oficial do WhatsApp Business.", status: "available", lastSync: "—", icon: "message-circle" },
  { id: "stripe", name: "Stripe", category: "Pagamentos", description: "Assinaturas e cobranças recorrentes.", status: "connected", lastSync: "Há 12 min", icon: "credit-card" },
  { id: "mercado-pago", name: "Mercado Pago", category: "Pagamentos", description: "Pix, boleto e cartão para o Brasil.", status: "error", lastSync: "Falha há 2 h", icon: "wallet" },
  { id: "google-calendar", name: "Google Calendar", category: "Produtividade", description: "Sincroniza agendamentos e reuniões.", status: "connected", lastSync: "Há 30 min", icon: "calendar" },
  { id: "google-drive", name: "Google Drive", category: "Produtividade", description: "Anexos e documentos de contatos.", status: "available", lastSync: "—", icon: "hard-drive" },
  { id: "openai", name: "OpenAI", category: "IA", description: "Geração de texto e sugestões (GPT).", status: "connected", lastSync: "Há 5 min", icon: "sparkles" },
  { id: "claude", name: "Claude", category: "IA", description: "Assistente de escrita e análise (Anthropic).", status: "connected", lastSync: "Há 6 min", icon: "bot" },
  { id: "gemini", name: "Gemini", category: "IA", description: "Modelos multimodais do Google.", status: "available", lastSync: "—", icon: "gem" },
  { id: "n8n", name: "n8n", category: "Automação", description: "Orquestração de workflows externos.", status: "connected", lastSync: "Há 40 min", icon: "workflow" },
];

export const integrationStatusLabel: Record<IntegrationStatusKey, string> = {
  connected: "Conectado",
  available: "Disponível",
  error: "Erro",
};

export const integrationStatusTone: Record<IntegrationStatusKey, NonNullable<BadgeProps["tone"]>> = {
  connected: "success",
  available: "neutral",
  error: "danger",
};

export const integrationCategories = ["Todas", "Anúncios", "Analytics", "Mensageria", "Pagamentos", "Produtividade", "IA", "Automação"];
