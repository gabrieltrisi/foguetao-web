import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { parseSendMessageBody } from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

/**
 * POST /api/messaging/messages - envia (messaging.messages.send).
 * O backend responde 202: envio assincrono, idempotente por clientMessageId.
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const body = parseSendMessageBody(await request.json().catch(() => ({})));
    return NextResponse.json(await withCompany((ctx) => messagingService.sendMessage(ctx, body)), {
      status: 202,
    });
  });
}
