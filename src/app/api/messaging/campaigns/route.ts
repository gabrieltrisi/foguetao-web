import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { campaignsService } from "@/lib/api/campaigns/service";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/messaging/campaigns — lista da empresa ativa. */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const params = queryParams(request);
    return NextResponse.json(await withCompany((ctx) => campaignsService.list(ctx, params)));
  });
}

/** POST /api/messaging/campaigns — cria (nasce DRAFT). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => campaignsService.create(ctx, body)), {
      status: 201,
    });
  });
}
