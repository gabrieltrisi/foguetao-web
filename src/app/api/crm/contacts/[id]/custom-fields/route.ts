import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseSetCustomFieldValuesBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

type P = { params: Promise<{ id: string }> };

/**
 * PUT /api/crm/contacts/:id/custom-fields — grava valores em lote
 * (crm.contacts.update). `null` limpa o valor. A leitura vem embutida no
 * detalhe do contato. A validação por tipo é do backend, a autoridade final.
 */
export function PUT(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const { values } = parseSetCustomFieldValuesBody(await request.json().catch(() => ({})));
    // propaga o { message } do backend sem reescrever
    return NextResponse.json(await withCompany((ctx) => crmService.setContactCustomFields(ctx, id, values)));
  });
}
