import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { auditService } from "@/lib/api/audit/service";
import { parseAuditListQuery } from "@/lib/api/validation";
import { queryParams, route } from "@/lib/api/route-helpers";

/** GET /api/admin/audit — registros de auditoria da empresa (company.audit.read). */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseAuditListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => auditService.list(ctx, filters)));
  });
}
