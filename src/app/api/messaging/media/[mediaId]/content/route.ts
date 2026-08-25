import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { backendUrl, COMPANY_ID_HEADER } from "@/lib/api/config";

type P = { params: Promise<{ mediaId: string }> };

/**
 * GET conteúdo binário da mídia (Fase 2) — PROXY de stream. O backend busca o
 * áudio/imagem sob demanda do provedor (Evolution) e devolve os bytes; aqui só
 * repassamos com auth (cookie httpOnly → Bearer + x-company-id), sem bufferizar
 * o corpo. Cache privado curto reduz re-fetch. messaging.media.read (no backend).
 */
export function GET(_r: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const mediaId = requireUuid((await params).mediaId, "mediaId");
    return withCompany(async ({ token, companyId }) => {
      const upstream = await fetch(backendUrl(`/messaging/media/${mediaId}/content`), {
        headers: { authorization: `Bearer ${token}`, [COMPANY_ID_HEADER]: companyId },
      });
      if (!upstream.ok || !upstream.body) {
        return new NextResponse(null, { status: upstream.status || 502 });
      }
      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
          "cache-control": "private, max-age=300",
          "x-content-type-options": "nosniff",
        },
      });
    });
  });
}
