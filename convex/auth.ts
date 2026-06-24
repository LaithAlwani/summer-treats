import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Single-owner admin login. The family signs up once on first run
// (see /admin/login). After that, sign-ups are blocked server-side so a
// random visitor can never create an admin account.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, { existingUserId, profile }) {
      // Signing in to the existing account — keep it.
      if (existingUserId) return existingUserId;

      // New sign-up: only allowed if there is no owner yet.
      const owner = await ctx.db.query("users").first();
      if (owner) {
        throw new Error(
          "Sign-ups are closed — this portal already has an owner.",
        );
      }
      return await ctx.db.insert("users", { email: profile.email });
    },
  },
});
