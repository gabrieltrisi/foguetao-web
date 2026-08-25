import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid, parseCreateAttributionBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { attributionService } from "@/lib/api/marketing/service";

type P = { params: Promise<{ id: string }> };

/**
 * GET /api/crm/contacts/:id/attributions - historico de origem do contato
 * (attribution.read). `firstTouch`/`lastTouch` vem DERIVADOS do backend.
 */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const contactId = requireUuid((await params).id, "id");
    return NextResponse.json(
      await withCompany((ctx) => attributionService.listContactAttributions(ctx, contactId)),
    );
  });
}

/**
 * POST /api/crm/contacts/:id/attributions - registra um toque
 * (attribution.create). O backend deduplica: captura identica devolve o
 * registro existente em vez de duplicar o historico.
 */
export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const contactId = requireUuid((await params).id, "id");
    const body = parseCreateAttributionBody(await request.json().catch(() => ({})));
    return NextResponse.json(
      await withCompany((ctx) => attributionService.createAttribution(ctx, contactId, body)),
      { status: 201 },
    );
  });
}
