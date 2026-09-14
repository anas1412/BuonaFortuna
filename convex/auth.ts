import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';

/**
 * One shop, one back office. Only addresses listed in ADMIN_EMAIL
 * (comma-separated) may create an account or sign in — there are no
 * customer accounts anywhere on the site.
 */
function isAllowed(email: string) {
  const allowed = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? '');
        if (!isAllowed(email)) {
          throw new ConvexError("Cette adresse n'est pas autorisée.");
        }
        return { email: email.toLowerCase() };
      },
      validatePasswordRequirements(password) {
        if (password.length < 8) {
          throw new ConvexError('Le mot de passe doit faire au moins 8 caractères.');
        }
      },
    }),
  ],
});
