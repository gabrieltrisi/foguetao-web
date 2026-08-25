import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { messageTemplatesService } from "@/lib/api/messaging-templates/service";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/messaging/templates — lista (busca + paginação). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const params = queryParams(request);
    return NextResponse.json(
      await withCompany((ctx) => messageTemplatesService.list(ctx, params)),
    );
  });
}

/** POST /api/messaging/templates — cria template. */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      await withCompany((ctx) => messageTemplatesService.create(ctx, body)),
      { status: 201 },
    );
  });
}
