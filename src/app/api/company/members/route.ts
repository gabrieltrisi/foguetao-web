import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { parseMemberListQuery } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/company/members — membros da empresa ativa. */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseMemberListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => companyService.listMembers(ctx, filters)));
  });
}
