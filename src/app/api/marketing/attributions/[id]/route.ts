import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseUpdateAttributionBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/marketing/attributions/:id (attribution.read). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(
      await withCompany((ctx) => attributionService.getAttribution(ctx, id)),
    );
  });
}

/**
 * PATCH /api/marketing/attributions/:id - corrige o VINCULO (attribution.update).
 * UTMs, URLs e capturedAt sao imutaveis: o parser rejeita antes do backend.
 */
export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = parseUpdateAttributionBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => attributionService.updateAttribution(ctx, id, body)),
    );
  });
}

/** DELETE /api/marketing/attributions/:id (attribution.delete). */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(
      await withCompany((ctx) => attributionService.deleteAttribution(ctx, id)),
    );
  });
}
