import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { route } from "@/lib/api/route-helpers";

/** GET /api/admin/permissions — catálogo de permissões (exige company.roles.read). */
export function GET(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => companyService.permissionCatalog(ctx))),
  );
}
