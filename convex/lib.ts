import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import type { MutationCtx, QueryCtx } from './_generated/server';

/** Sign-up is allowlisted, so any signed-in user is shop staff. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Connexion requise.');
  return userId;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "trench-beige-sandro-38", then "-2", "-3"… if the slug is already taken. */
export async function uniqueProductSlug(ctx: MutationCtx, base: string, ignoreId?: string) {
  let slug = base || 'article';
  for (let n = 2; ; n++) {
    const clash = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    if (!clash || clash._id === ignoreId) return slug;
    slug = `${base}-${n}`;
  }
}
