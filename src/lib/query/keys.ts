/** Chaves de query centralizadas para invalidação consistente. */
export const queryKeys = {
  session: ["session"] as const,
  sessions: ["auth", "sessions"] as const,
  members: (companyId: string | null) => ["company", companyId, "members"] as const,
};
