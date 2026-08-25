import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { messageTemplatesService } from "@/lib/api/messaging-templates/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ templateId: string }> };

export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).templateId, "templateId");
    return NextResponse.json(await withCompany((ctx) => messageTemplatesService.get(ctx, id)));
  });
}

export function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).templateId, "templateId");
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      await withCompany((ctx) => messageTemplatesService.update(ctx, id, body)),
    );
  });
}

export function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).templateId, "templateId");
    await withCompany((ctx) => messageTemplatesService.remove(ctx, id));
    return new NextResponse(null, { status: 204 });
  });
}
