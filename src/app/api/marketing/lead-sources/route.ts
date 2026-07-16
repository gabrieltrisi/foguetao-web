import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseLeadSourceListQuery, parseCreateLeadSourceBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

/** GET /api/marketing/lead-sources - catalogo da empresa (lead_sources.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseLeadSourceListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => attributionService.listLeadSources(ctx, filters)),
    );
  });
}

/** POST /api/marketing/lead-sources - cria origem (lead_sources.manage). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateLeadSourceBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => attributionService.createLeadSource(ctx, body)),
      { status: 201 },
    );
  });
}
