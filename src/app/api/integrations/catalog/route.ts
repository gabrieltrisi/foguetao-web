import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { parseCatalogQuery } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/integrations/catalog — catálogo do produto (não executa provider). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseCatalogQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => integrationsService.catalog(ctx, filters)));
  });
}
