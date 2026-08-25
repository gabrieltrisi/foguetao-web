import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { creativesService } from "@/lib/api/creatives/service";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/creatives — lista (paginação por cursor). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const params = queryParams(request);
    return NextResponse.json(await withCompany((ctx) => creativesService.list(ctx, params)));
  });
}

/** POST /api/creatives — gera um criativo (síncrono, pode levar alguns segundos). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      await withCompany((ctx) => creativesService.generate(ctx, body)),
      { status: 201 },
    );
  });
}
