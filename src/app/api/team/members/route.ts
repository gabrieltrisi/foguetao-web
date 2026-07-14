import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { withAuth } from "@/lib/auth/session";
import { listMembersRequest } from "@/lib/auth/service";

/** GET /api/team/members — membros da empresa ativa (exige company.members.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "50");

    const members = await withAuth(({ token, companyId }) => {
      if (!companyId) {
        throw new ApiError({
          statusCode: 400,
          code: ErrorCode.COMPANY_CONTEXT_REQUIRED,
          message: "Nenhuma empresa ativa",
        });
      }
      return listMembersRequest(token, companyId, { page, limit });
    });

    return NextResponse.json(members);
  });
}
