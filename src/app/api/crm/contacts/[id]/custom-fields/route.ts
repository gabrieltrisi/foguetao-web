import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withCompany } from "@/lib/auth/session";
import { crmService } from "@/lib/api/crm/service";

export function PUT(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const values = (body?.values ?? {}) as Record<string, unknown>;
    await withCompany((ctx) => crmService.setContactCustomFields(ctx, id, values));
    return NextResponse.json({ ok: true });
  });
}
