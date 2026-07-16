import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseTagListQuery, parseCreateTagBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

/** GET /api/crm/tags — tags da empresa (paginado; exige crm.tags.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseTagListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => crmService.listTags(ctx, filters)));
  });
}

/** POST /api/crm/tags — cria uma tag (exige crm.tags.create). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateTagBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => crmService.createTag(ctx, body)), {
      status: 201,
    });
  });
}
