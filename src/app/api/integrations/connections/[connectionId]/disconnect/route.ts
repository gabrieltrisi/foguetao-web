import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ connectionId: string }> };

/** POST /api/integrations/connections/:id/disconnect — sem corpo (contrato do backend). */
export function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    return NextResponse.json(await withCompany((ctx) => integrationsService.disconnect(ctx, id)));
  });
}
