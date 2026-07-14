import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

export function GET(request: Request): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => crmService.listTags(ctx, queryParams(request)))),
  );
}
