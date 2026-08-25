import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/session";
import { companyService } from "@/lib/api/company/service";
import { requireInviteToken } from "@/lib/api/validation";
import { route } from "@/lib/api/route-helpers";

/**
 * POST /api/company/invitations/accept — aceita um convite.
 *
 * Usa `withAuth` (não `withCompany`): o backend expõe esta rota apenas
 * autenticada, SEM contexto de empresa — quem aceita ainda não é membro dela.
 * O token vai no corpo, não na URL, para não vazar em log/referrer.
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = (await request.json().catch(() => ({}))) as { token?: unknown };
    const inviteToken = requireInviteToken(body.token);
    return NextResponse.json(
      await withAuth(({ token }) => companyService.acceptInvitation(token, inviteToken)),
    );
  });
}
