import { z } from "zod";

export const userStatusSchema = z.enum(["ACTIVE", "PENDING", "BLOCKED", "DISABLED"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

/** UserResponseDto do backend (sem passwordHash). */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: userStatusSchema,
  emailVerifiedAt: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ApiUser = z.infer<typeof userSchema>;

/** AuthTokensResponseDto: login. */
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  user: userSchema,
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

/** TokenPairResponseDto: refresh/change-password. */
export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

/** SessionResponseDto. */
export const sessionSchema = z.object({
  id: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  expiresAt: z.string(),
  current: z.boolean(),
});
export type ApiSession = z.infer<typeof sessionSchema>;
export const sessionListSchema = z.array(sessionSchema);

export const messageResponseSchema = z.object({
  message: z.string(),
  resetToken: z.string().optional(),
});
