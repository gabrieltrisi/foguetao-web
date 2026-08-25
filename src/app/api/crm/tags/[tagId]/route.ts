import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseUpdateTagBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ tagId: string }> };

/** GET /api/crm/tags/:tagId — detalhe da tag (crm.tags.read). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const tagId = requireUuid((await params).tagId, "tagId");
    return NextResponse.json(await withCompany((ctx) => crmService.getTag(ctx, tagId)));
  });
}

/** PATCH /api/crm/tags/:tagId — atualiza a tag (crm.tags.update). */
export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const tagId = requireUuid((await params).tagId, "tagId");
    const body = parseUpdateTagBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => crmService.updateTag(ctx, tagId, body)));
  });
}

/** DELETE /api/crm/tags/:tagId — exclui a tag (crm.tags.delete). */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const tagId = requireUuid((await params).tagId, "tagId");
    // propaga o payload do backend ({ message }) sem reescrever
    return NextResponse.json(await withCompany((ctx) => crmService.deleteTag(ctx, tagId)));
  });
}
