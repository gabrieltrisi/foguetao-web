import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { campaignsService } from "@/lib/api/campaigns/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ campaignId: string }> };

/** POST /api/messaging/campaigns/:id/cancel — cancela (paginado no backend). */
export function POST(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).campaignId, "campaignId");
    return NextResponse.json(await withCompany((ctx) => campaignsService.cancel(ctx, id)));
  });
}
