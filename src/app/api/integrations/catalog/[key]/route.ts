import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { requireCatalogKey } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ key: string }> };

/** GET /api/integrations/catalog/:key — detalhe de um item do catálogo. */
export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const key = requireCatalogKey((await params).key);
    return NextResponse.json(await withCompany((ctx) => integrationsService.catalogItem(ctx, key)));
  });
}
