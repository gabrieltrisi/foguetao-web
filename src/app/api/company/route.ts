import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { parseUpdateCompanyBody } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

/** GET /api/company — dados da empresa ativa (exige company.read). */
export function GET(): Promise<NextResponse> {
  return route(async () => NextResponse.json(await withCompany((ctx) => companyService.get(ctx))));
}

/** PATCH /api/company — atualiza a empresa ativa (exige company.update). */
export function PATCH(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseUpdateCompanyBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => companyService.update(ctx, body)));
  });
}
