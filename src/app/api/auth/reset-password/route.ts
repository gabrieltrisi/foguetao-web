import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { resetPasswordRequest } from "@/lib/auth/service";

const bodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(1),
});

/**
 * POST /api/auth/reset-password — redefine a senha usando o token de reset.
 * O backend valida a força da senha e a validade do token (400 se inválido).
 */
export function POST(request: Request): Promise<NextResponse> {
  return route(async () => {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Token ou senha inválidos.",
      });
    }
    const userAgent = request.headers.get("user-agent");
    const result = await resetPasswordRequest(
      parsed.data.token,
      parsed.data.newPassword,
      userAgent,
    );
    return NextResponse.json({ message: result.message });
  });
}
