import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseUpdateLeadSourceBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/marketing/lead-sources/:id (lead_sources.read). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => attributionService.getLeadSource(ctx, id)));
  });
}

/** PATCH /api/marketing/lead-sources/:id (lead_sources.manage). */
export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = parseUpdateLeadSourceBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => attributionService.updateLeadSource(ctx, id, body)),
    );
  });
}

/**
 * DELETE /api/marketing/lead-sources/:id (lead_sources.manage).
 * O backend recusa origem padrao ou em uso (409) - aqui so repassamos.
 */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(
      await withCompany((ctx) => attributionService.deleteLeadSource(ctx, id)),
    );
  });
}
