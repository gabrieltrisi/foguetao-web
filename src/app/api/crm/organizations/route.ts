import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

export function GET(request: Request): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => crmService.listOrganizations(ctx, queryParams(request)))),
  );
}

export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => crmService.createOrganization(ctx, body)), { status: 201 });
  });
}
