import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { dealsService } from "@/lib/api/crm-deals/service";

export function GET(request: Request): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => dealsService.list(ctx, queryParams(request)))),
  );
}

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => dealsService.create(ctx, body)), { status: 201 });
  });
}
