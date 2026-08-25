import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseCampaignListQuery, parseCreateCampaignBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { marketingService } from "@/lib/api/marketing/service";

/** GET /api/marketing/campaigns - lista paginada (campaigns.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseCampaignListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => marketingService.listCampaigns(ctx, filters)),
    );
  });
}

/** POST /api/marketing/campaigns - cria (campaigns.create). Nasce em DRAFT. */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateCampaignBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => marketingService.createCampaign(ctx, body)),
      { status: 201 },
    );
  });
}
