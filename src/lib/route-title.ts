import { allNavItems } from "@/config/nav";
import { routeMeta } from "@/config/routes";

/** Rótulos de rotas internas fora do mapa da sidebar (ex.: módulo Comunicação). */
const extraTitles: Record<string, string> = {
  "/inbox": "Inbox",
  "/templates": "Templates",
  "/labels": "Etiquetas",
  "/queues": "Filas",
  "/ai-assistant": "Assistente de IA",
  "/design-system": "Design System",
  "/tiktok-ads": "TikTok Ads",
  "/landing-pages": "Landing Pages",
  "/utm-builder": "UTM Builder",
  "/lead-sources": "Origens de lead",
  "/forms": "Formulários",
  "/commissions": "Comissões",
  "/automation-templates": "Templates",
  "/automation-executions": "Execuções",
  "/automation-variables": "Variáveis",
  "/automation-ai": "Assistente de IA",
  "/scheduler": "Agendador",
  "/webhooks": "Webhooks",
};

/** Retorna o rótulo legível da rota atual para breadcrumb / título. */
export function getRouteTitle(pathname: string): string {
  const navItem = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (navItem) return navItem.label;

  const extraKey = Object.keys(extraTitles).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  if (extraKey) return extraTitles[extraKey];

  const metaKey = Object.keys(routeMeta).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  if (metaKey) return routeMeta[metaKey].title;

  return "Painel";
}
