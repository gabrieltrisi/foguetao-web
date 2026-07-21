import { NextResponse } from "next/server";
import { z } from "zod";
import { route } from "@/lib/api/route-helpers";
import { ApiError, ErrorCode } from "@/types/api/error";
import { resendVerificationRequest } from "@/lib/auth/service";

const bodySchema = z.object({ email: z.string().email() });

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
    const result = await resendVerificationRequest(parsed.data.email, userAgent);
    return NextResponse.json({ message: result.message });
  });
}
