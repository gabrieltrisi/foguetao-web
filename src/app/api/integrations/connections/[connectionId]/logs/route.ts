import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { parseLogListQuery, requireUuid } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ connectionId: string }> };

/** GET /api/integrations/connections/:id/logs — logs de execução (sem segredos). */
export function GET(request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    const filters = parseLogListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => integrationsService.logs(ctx, id, filters)));
  });
}
