import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import type { QueryCtx } from './_generated/server';
import { roleOf } from './lib';

/**
 * One shop, one back office, no customer accounts. Only owners (ADMIN_EMAIL)
 * and people added on the Équipe page may create an account or sign in.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return { email: String(params.email ?? '').trim().toLowerCase() };
      },
      validatePasswordRequirements(password) {
        if (password.length < 8) {
          throw new ConvexError('Le mot de passe doit faire au moins 8 caractères.');
        }
      },
    }),
  ],
  callbacks: {
    // Runs on every sign-in, sign-up included: no session unless the address is on the team.
    async beforeSessionCreation(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user?.email || !(await roleOf(ctx as unknown as QueryCtx, user.email))) {
        throw new ConvexError("Cette adresse n'est pas autorisée.");
      }
    },
  },
});
