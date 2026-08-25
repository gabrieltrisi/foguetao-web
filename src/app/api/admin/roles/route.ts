import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { route } from "@/lib/api/route-helpers";

/** GET /api/admin/roles — papéis do sistema (exige company.roles.read). */
export function GET(): Promise<NextResponse> {
  return route(async () =>
    NextResponse.json(await withCompany((ctx) => companyService.listRoles(ctx))),
  );
}
