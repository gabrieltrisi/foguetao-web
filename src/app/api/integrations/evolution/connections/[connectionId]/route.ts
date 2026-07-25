import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ connectionId: string }> };

/** GET /api/integrations/evolution/connections/:id — visão pública da conexão. */
export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    return NextResponse.json(await withCompany((ctx) => integrationsService.evolutionGet(ctx, id)));
  });
}
