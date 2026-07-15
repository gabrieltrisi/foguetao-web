import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { integrationsService } from "@/lib/api/integrations/service";
import { parseUpdateConnectionBody, requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ connectionId: string }> };

export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    return NextResponse.json(await withCompany((ctx) => integrationsService.get(ctx, id)));
  });
}

export function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    const body = parseUpdateConnectionBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => integrationsService.update(ctx, id, body)));
  });
}

/** DELETE — propaga o `{message}` do backend, sem inventar payload. */
export function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).connectionId, "connectionId");
    return NextResponse.json(await withCompany((ctx) => integrationsService.remove(ctx, id)));
  });
}
