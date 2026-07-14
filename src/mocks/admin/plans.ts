import type { Plan, PlanFeatureRow } from "@/types/admin";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "R$ 149",
    period: "/mês",
    description: "Para começar a organizar o comercial.",
    highlights: ["3 usuários", "2.000 contatos", "10 automações", "Suporte por e-mail"],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "R$ 449",
    period: "/mês",
    description: "Para times que escalam marketing e vendas.",
    popular: true,
    current: true,
    highlights: ["25 usuários", "50.000 contatos", "Automações ilimitadas", "Suporte prioritário"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Sob consulta",
    period: "",
    description: "Para operações de alta escala e governança.",
    highlights: ["Usuários ilimitados", "Contatos ilimitados", "SSO + SLA dedicado", "Gerente de conta"],
  },
];

export const planComparison: PlanFeatureRow[] = [
  { label: "Usuários", starter: "3", pro: "25", enterprise: "Ilimitado" },
  { label: "Contatos", starter: "2.000", pro: "50.000", enterprise: "Ilimitado" },
  { label: "Campanhas / mês", starter: "20", pro: "500", enterprise: "Ilimitado" },
  { label: "Automações", starter: "10", pro: "Ilimitado", enterprise: "Ilimitado" },
  { label: "Domínios", starter: "1", pro: "5", enterprise: "Ilimitado" },
  { label: "API Keys", starter: false, pro: "10", enterprise: "Ilimitado" },
  { label: "White label", starter: false, pro: true, enterprise: true },
  { label: "SSO / SAML", starter: false, pro: false, enterprise: true },
  { label: "SLA dedicado", starter: false, pro: false, enterprise: true },
  { label: "Suporte", starter: "E-mail", pro: "Prioritário", enterprise: "24/7 + CSM" },
];
