import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseUpdateCustomFieldBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ fieldId: string }> };

/** GET /api/crm/custom-fields/:fieldId — detalhe (crm.custom_fields.read). */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const fieldId = requireUuid((await params).fieldId, "fieldId");
    return NextResponse.json(await withCompany((ctx) => crmService.getCustomFieldDef(ctx, fieldId)));
  });
}

/**
 * PATCH /api/crm/custom-fields/:fieldId — atualiza (crm.custom_fields.update).
 * `key` não é aceito (imutável). Trocar `type` com valores existentes é
 * recusado pelo backend com 409 CUSTOM_FIELD_TYPE_IMMUTABLE.
 */
export function PATCH(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const fieldId = requireUuid((await params).fieldId, "fieldId");
    const body = parseUpdateCustomFieldBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => crmService.updateCustomFieldDef(ctx, fieldId, body)),
    );
  });
}

/**
 * DELETE /api/crm/custom-fields/:fieldId — exclui (crm.custom_fields.delete).
 * Soft delete no backend: os valores já gravados são preservados.
 */
export function DELETE(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const fieldId = requireUuid((await params).fieldId, "fieldId");
    // propaga o { message } do backend sem reescrever
    return NextResponse.json(await withCompany((ctx) => crmService.deleteCustomFieldDef(ctx, fieldId)));
  });
}
