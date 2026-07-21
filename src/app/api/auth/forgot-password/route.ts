import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { forgotPasswordRequest } from "@/lib/auth/service";

const bodySchema = z.object({ email: z.string().email() });

/**
 * POST /api/auth/forgot-password — solicita o e-mail de recuperação de senha.
 * A resposta é sempre genérica (não revela se o e-mail existe).
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Informe um e-mail válido.",
      });
    }
    const userAgent = request.headers.get("user-agent");
    const result = await forgotPasswordRequest(parsed.data.email, userAgent);
    return NextResponse.json({ message: result.message });
  });
}
