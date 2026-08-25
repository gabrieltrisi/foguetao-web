import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import { parseCustomFieldListQuery, parseCreateCustomFieldBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

/**
 * GET /api/crm/custom-fields — definições (crm.custom_fields.read).
 * O backend aceita SOMENTE `entityType` e devolve um array puro (sem paginação).
 */
export function GET(request: Request): Promise<NextResponse> {
  return route(async () => {
    const filters = parseCustomFieldListQuery(queryParams(request));
    return NextResponse.json(await withCompany((ctx) => crmService.listCustomFieldDefs(ctx, filters)));
  });
}

/** POST /api/crm/custom-fields — cria definição (crm.custom_fields.create). */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseCreateCustomFieldBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => crmService.createCustomFieldDef(ctx, body)), {
      status: 201,
    });
  });
}
