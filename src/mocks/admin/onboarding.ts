import type { OnboardingOption } from "@/types/admin";

export const onboardingSegments: OnboardingOption[] = [
  { value: "academia", label: "Academia", icon: "dumbbell" },
  { value: "clinica", label: "Clínica", icon: "stethoscope" },
  { value: "restaurante", label: "Restaurante", icon: "utensils" },
  { value: "loja", label: "Loja", icon: "shopping-bag" },
  { value: "imobiliaria", label: "Imobiliária", icon: "building-2" },
  { value: "advocacia", label: "Advocacia", icon: "scale" },
  { value: "agencia", label: "Agência", icon: "megaphone" },
  { value: "infoproduto", label: "Infoprodutor", icon: "graduation-cap" },
  { value: "outro", label: "Outro", icon: "ellipsis" },
];

export const onboardingObjectives: OnboardingOption[] = [
  { value: "leads", label: "Captar Leads", icon: "magnet" },
  { value: "vender", label: "Vender", icon: "trending-up" },
  { value: "atender", label: "Atender", icon: "headset" },
  { value: "automatizar", label: "Automatizar", icon: "workflow" },
  { value: "tudo", label: "Tudo", icon: "sparkles" },
];

export const onboardingChannels: OnboardingOption[] = [
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "facebook", label: "Facebook", icon: "facebook" },
  { value: "google", label: "Google", icon: "search" },
  { value: "whatsapp", label: "WhatsApp", icon: "message-circle" },
  { value: "tiktok", label: "TikTok", icon: "music" },
  { value: "site", label: "Site", icon: "globe" },
  { value: "indicacao", label: "Indicação", icon: "users" },
];

export const onboardingTemplates: { value: string; label: string; description: string }[] = [
  { value: "vendas", label: "Funil de vendas", description: "Pipeline comercial pronto com 5 etapas." },
  { value: "atendimento", label: "Atendimento", description: "Filas e automações de suporte." },
  { value: "marketing", label: "Marketing completo", description: "Campanhas, landing pages e nutrição." },
  { value: "captura", label: "Captura de leads", description: "Formulários + automação de boas-vindas." },
];

export const onboardingSteps = [
  { label: "Segmento" },
  { label: "Objetivo" },
  { label: "Canais" },
  { label: "Template" },
  { label: "Resumo" },
];
