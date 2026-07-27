import { NextResponse } from "next/server";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { quizLeadPayloadSchema } from "@/features/landing/quiz/utils/validation";
import { captureQuizLead } from "@/lib/landing/lead-capture";

/**
 * Captação pública do lead do quiz da landing. Valida o payload e delega ao seam
 * (`captureQuizLead`), que entrega ao CRM quando configurado ou registra e
 * conclui com sucesso quando desligado. Nunca vaza erro de entrega ao cliente.
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = quizLeadPayloadSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Dados do diagnóstico inválidos.",
      });
    }

    const result = await captureQuizLead(parsed.data);
    return NextResponse.json({ ok: result.ok, delivered: result.delivered }, { status: 201 });
  });
}
