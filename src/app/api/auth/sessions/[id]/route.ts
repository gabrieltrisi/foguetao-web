import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withAuth } from "@/lib/auth/session";
import { requireUuid } from "@/lib/api/validation";
import { revokeSessionRequest } from "@/lib/auth/service";

/**
 * DELETE /api/auth/sessions/:id — revoga uma sessão específica.
 *
 * Propaga o `{message}` do backend: inventar `{ok:true}` esconderia o contrato
 * real. O id é validado aqui (o backend não usa ParseUUIDPipe nesta rota).
 */
export function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    return NextResponse.json(await withAuth(({ token }) => revokeSessionRequest(token, id)));
  });
}
