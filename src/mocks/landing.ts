import {
  BarChart3,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  SquareKanban,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type LandingFeature = {
  label: string;
  icon: LucideIcon;
};

export type LandingPillar = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Grade "Tudo o que sua operação precisa para crescer" (página 6). */
export const landingFeatures: LandingFeature[] = [
  { label: "CRM completo", icon: Users },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Campanhas", icon: Megaphone },
  { label: "Meta Ads", icon: BarChart3 },
  { label: "Google Ads", icon: BarChart3 },
  { label: "Afiliados", icon: Users },
  { label: "Automação", icon: Workflow },
  { label: "Relatórios", icon: BarChart3 },
];

/** Cards "Uma operação inteira, em uma única tela." (página 6). */
export const landingPillars: LandingPillar[] = [
  {
    icon: Users,
    title: "Contatos organizados",
    description: "Segmentos, tags e histórico completo em cada cadastro.",
  },
  {
    icon: SquareKanban,
    title: "Pipeline comercial",
    description: "Fases claras, previsibilidade e ganho por período.",
  },
  {
    icon: MessagesSquare,
    title: "Conversas centralizadas",
    description: "Todo o WhatsApp e canais em uma inbox única.",
  },
];

export const landingBenefits: string[] = [
  "14 dias grátis",
  "Sem cartão",
  "Suporte em português",
];

export const landingNav: { label: string; href: string }[] = [
  { label: "Produto", href: "#produto" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Integrações", href: "#integracoes" },
  { label: "Preços", href: "#precos" },
  { label: "Recursos", href: "#recursos" },
];
