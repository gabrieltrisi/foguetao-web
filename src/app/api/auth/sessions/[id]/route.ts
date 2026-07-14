import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { withAuth } from "@/lib/auth/session";
import { revokeSessionRequest } from "@/lib/auth/service";

/** DELETE /api/auth/sessions/:id — revoga uma sessão específica. */
export function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  return route(async () => {
    const { id } = await params;
    await withAuth(({ token }) => revokeSessionRequest(token, id));
    return NextResponse.json({ ok: true });
  });
}
