import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

/** GET /api/messaging/accounts - contas (messaging.accounts.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(
      await withCompany((ctx) => messagingService.listAccounts(ctx, queryParams(request))),
    ),
  );
}
