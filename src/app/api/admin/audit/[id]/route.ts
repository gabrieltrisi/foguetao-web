import { NextResponse } from "next/server";
import { withCompany } from "@/lib/auth/session";
import { auditService } from "@/lib/api/audit/service";
import { requireUuid } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/audit/:id — detalhe de um registro. */
export function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withCompany((ctx) => auditService.get(ctx, id)));
  });
}
