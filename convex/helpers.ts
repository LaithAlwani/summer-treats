import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Throws unless the caller is signed in. Single-owner portal, so any
 * authenticated user is the admin. This is the real security boundary —
 * every admin query/mutation must call it.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}
