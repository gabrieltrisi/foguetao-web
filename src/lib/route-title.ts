import { allNavItems } from "@/config/nav";
import { routeMeta } from "@/config/routes";

/** Retorna o rótulo legível da rota atual para breadcrumb / título. */
export function getRouteTitle(pathname: string): string {
  const navItem = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (navItem) return navItem.label;

  const metaKey = Object.keys(routeMeta).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  if (metaKey) return routeMeta[metaKey].title;

  return "Painel";
}
