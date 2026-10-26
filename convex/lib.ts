import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

export type Role = Doc<'team'>['role'];

/** On sale or reserved: shown in lists, counts and « similar ». Sold pieces keep a page but leave lists. */
export const isListed = (p: Pick<Doc<'products'>, 'status'>) => p.status === 'available' || p.status === 'reserved';
/** Has a public page at all. Drafts don't exist for customers: 404, no sitemap entry. */
export const isPublic = (p: Pick<Doc<'products'>, 'status'>) => p.status !== 'draft';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Owners: ADMIN_EMAIL, comma-separated. Always admins, never removable from the dashboard. */
export function ownerEmails() {
  return (process.env.ADMIN_EMAIL ?? '').split(',').map(normalizeEmail).filter(Boolean);
}

/** An address's role today, or null if it has no access. */
export async function roleOf(ctx: QueryCtx, email: string): Promise<Role | null> {
  const e = normalizeEmail(email);
  if (ownerEmails().includes(e)) return 'admin';
  const member = await ctx.db.query('team').withIndex('by_email', (q) => q.eq('email', e)).unique();
  return member?.role ?? null;
}

/** The signed-in staff member and their role, or null. Read fresh on every call. */
export async function currentStaff(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  const email = userId ? (await ctx.db.get(userId))?.email : undefined;
  const role = email ? await roleOf(ctx, email) : null;
  return userId && email && role ? { userId, email: normalizeEmail(email), role } : null;
}

/**
 * Any staff member. The role is checked on every call rather than at sign-in,
 * so removing someone from the team cuts them off at once.
 */
export async function requireStaff(ctx: QueryCtx | MutationCtx) {
  const staff = await currentStaff(ctx);
  if (!staff) throw new ConvexError('Connexion requise.');
  return staff;
}

/** Administrateurs only: deleting, categories, the team. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const staff = await requireStaff(ctx);
  if (staff.role !== 'admin') throw new ConvexError('Réservé aux administrateurs.');
  return staff;
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
