import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { parseCreateInvitationBody, parseInvitationListQuery } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/company/invitations — convites da empresa ativa. */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseInvitationListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => companyService.listInvitations(ctx, filters)),
    );
  });
}

/** POST /api/company/invitations — cria convite (201). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateInvitationBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => companyService.createInvitation(ctx, body)),
      { status: 201 },
    );
  });
}
