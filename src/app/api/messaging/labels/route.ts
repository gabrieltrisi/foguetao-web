import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

/** GET taxonomia de etiquetas. conversations.read. */
export function GET(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => messagingService.listLabels(ctx))),
  );
}

/** POST criar etiqueta. labels.manage. */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await withCompany((ctx) => messagingService.createLabel(ctx, body)));
  });
}
