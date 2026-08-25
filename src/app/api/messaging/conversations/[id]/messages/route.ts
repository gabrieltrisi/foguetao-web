import { NextResponse } from "next/server";
import { route, queryParams } from "@/lib/api/route-helpers";
import {
  requireUuid,
  parseMessageListQuery,
  parseSendConversationMessageBody,
} from "@/lib/api/validation";
import { withCompany } from "@/lib/auth/session";
import { messagingService } from "@/lib/api/messaging/service";

type P = { params: Promise<{ id: string }> };

/** GET /api/messaging/conversations/:id/messages - cursor (messaging.messages.read). */
export function GET(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const filters = parseMessageListQuery(queryParams(request));
    return NextResponse.json(
      await withCompany((ctx) => messagingService.listMessages(ctx, id, filters)),
    );
  });
}

/**
 * POST /api/messaging/conversations/:id/messages — envio conversation-scoped da
 * Inbox (Fase 6.2; messaging.messages.send). 202/QUEUED, idempotente por
 * clientMessageId. Espelha o backend; não repassa messagingAccountId/provider.
 */
export function POST(request: Request, { params }: P): Promise<NextResponse> {
  return route(async () => {
    const id = requireUuid((await params).id, "id");
    const body = parseSendConversationMessageBody(await request.json().catch(() => ({})));
    const clientMessageId =
      body.clientMessageId ?? `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json(
      await withCompany((ctx) =>
        messagingService.sendConversationMessage(ctx, id, {
          text: body.text,
          clientMessageId,
        }),
      ),
      { status: 202 },
    );
  });
}
