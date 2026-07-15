import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { parseUpdateMemberBody, requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ memberId: string }> };

export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).memberId, "memberId");
    return NextResponse.json(await withCompany((ctx) => companyService.getMember(ctx, id)));
  });
}

/** PATCH — altera papel e/ou status (ativar/suspender). */
export function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).memberId, "memberId");
    const body = parseUpdateMemberBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => companyService.updateMember(ctx, id, body)));
  });
}

/** DELETE — propaga o `{message}` do backend. */
export function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).memberId, "memberId");
    return NextResponse.json(await withCompany((ctx) => companyService.removeMember(ctx, id)));
  });
}
