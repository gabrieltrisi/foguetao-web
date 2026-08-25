import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ invitationId: string }> };

/** DELETE — revoga o convite. Propaga o `{message}` do backend. */
export function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).invitationId, "invitationId");
    return NextResponse.json(await withCompany((ctx) => companyService.revokeInvitation(ctx, id)));
  });
}
