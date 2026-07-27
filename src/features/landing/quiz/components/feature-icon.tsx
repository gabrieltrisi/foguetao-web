import { TrendingUp, BellRing, Users2, BarChart3, Layers3, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BenefitIconKey } from "@/config/landing/segments";

/** Mesmo mapa chave→ícone usado nos benefícios da landing (consistência visual). */
export const FEATURE_ICONS: Record<BenefitIconKey, LucideIcon> = {
  trendingUp: TrendingUp,
  bell: BellRing,
  users: Users2,
  chart: BarChart3,
  layers: Layers3,
  zap: Zap,
};
