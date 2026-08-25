import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ connectionId: string }> };

/** GET /api/integrations/evolution/connections/:id/state — estado reconciliado. */
export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    const state = await withCompany((ctx) => integrationsService.evolutionState(ctx, id));
    return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
  });
}
