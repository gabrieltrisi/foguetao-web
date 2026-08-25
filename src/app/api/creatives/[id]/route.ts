import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { creativesService } from "@/lib/api/creatives/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/creatives/:id — remove o criativo. */
export function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    await withCompany((ctx) => creativesService.remove(ctx, id));
    return new NextResponse(null, { status: 204 });
  });
}
