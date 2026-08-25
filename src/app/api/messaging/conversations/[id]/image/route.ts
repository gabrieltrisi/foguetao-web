import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { requireUuid } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/**
 * POST /api/messaging/conversations/:id/image — envio de imagem (outbound de mídia,
 * messaging.messages.send). Recebe o base64 do arquivo + legenda opcional e repassa
 * ao backend, que envia via Evolution e guarda os bytes. Validação forte no backend.
 */
export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const body = {
      base64: typeof raw.base64 === "string" ? raw.base64 : "",
      mimeType: typeof raw.mimeType === "string" ? raw.mimeType : "",
      filename: typeof raw.filename === "string" ? raw.filename : undefined,
      caption: typeof raw.caption === "string" ? raw.caption : undefined,
    };
    return NextResponse.json(
      await withCompany((ctx) => messagingService.sendConversationImage(ctx, id, body)),
    );
  });
}
