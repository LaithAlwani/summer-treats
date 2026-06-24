import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Admin login for the family. Up to MAX_ADMINS accounts can sign up; after
// that, sign-ups are blocked server-side so a random visitor can never create
// an admin account.
const MAX_ADMINS = 2;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, { existingUserId, profile }) {
      // Signing in to an existing account — keep it.
      if (existingUserId) return existingUserId;

      // New sign-up: only allowed until we reach the account limit.
      const users = await ctx.db.query("users").collect();
      if (users.length >= MAX_ADMINS) {
        throw new Error(
          `Sign-ups are closed — this portal already has ${MAX_ADMINS} accounts.`,
        );
      }
      return await ctx.db.insert("users", { email: profile.email });
    },
  },
});
