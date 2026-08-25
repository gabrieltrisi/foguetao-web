import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ mediaId: string }> };

/** GET metadados de mídia (sem bytes/URL — storage MOCK). messaging.media.read. */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const mediaId = requireUuid((await params).mediaId, "mediaId");
    return NextResponse.json(await withCompany((ctx) => messagingService.getMedia(ctx, mediaId)));
  });
}
