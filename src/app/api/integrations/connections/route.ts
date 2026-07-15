import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { parseConnectionListQuery, parseCreateConnectionBody } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/integrations/connections — conexões da empresa ativa. */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseConnectionListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => integrationsService.list(ctx, filters)));
  });
}

/** POST /api/integrations/connections — cria conexão (nasce DRAFT). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateConnectionBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => integrationsService.create(ctx, body)), {
      status: 201,
    });
  });
}
