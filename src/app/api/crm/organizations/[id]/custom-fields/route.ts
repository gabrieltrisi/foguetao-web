import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseSetCustomFieldValuesBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string }> };

/**
 * GET /api/crm/organizations/:id/custom-fields — valores da organização
 * (crm.organizations.read). Caminho de leitura próprio: o detalhe da
 * organização não embute os valores.
 */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => crmService.getOrgCustomFields(ctx, id)));
  });
}

/**
 * PUT /api/crm/organizations/:id/custom-fields — grava valores em lote
 * (crm.organizations.update). `null` limpa o valor. A validação por tipo é do
 * backend, a autoridade final.
 */
export function PUT(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const { values } = parseSetCustomFieldValuesBody(await request.json().catch(() => ({})));
    // propaga o { message } do backend sem reescrever
    return NextResponse.json(await withCompany((ctx) => crmService.setOrgCustomFields(ctx, id, values)));
  });
}
