import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { currentStaff, normalizeEmail, ownerEmails, requireAdmin, roleOf } from './lib';
import { staffRole } from './schema';

/** Who's signed in, for the admin shell. Null when the account has no access (anymore). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const staff = await currentStaff(ctx);
    return staff && { email: staff.email, role: staff.role, owner: ownerEmails().includes(staff.email) };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const members = await ctx.db.query('team').collect();
    // Has the person created their account yet?
    const joined = async (email: string) =>
      (await ctx.db.query('users').withIndex('email', (q) => q.eq('email', email)).first()) !== null;
    return Promise.all([
      ...ownerEmails().map(async (email) => ({ id: null, email, role: 'admin' as const, owner: true, joined: await joined(email) })),
      ...members
        .sort((a, b) => a.addedAt - b.addedAt)
        .map(async (m) => ({ id: m._id, email: m.email, role: m.role, owner: false, joined: await joined(m.email) })),
    ]);
  },
});

export const add = mutation({
  args: { email: v.string(), role: staffRole },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ConvexError('Adresse e-mail invalide.');
    if ((await roleOf(ctx, email)) !== null) throw new ConvexError('Cette adresse fait déjà partie de l’équipe.');
    await ctx.db.insert('team', { email, role: args.role, addedAt: Date.now() });
  },
});

export const setRole = mutation({
  args: { id: v.id('team'), role: staffRole },
  handler: async (ctx, { id, role }) => {
    const me = await requireAdmin(ctx);
    const member = await ctx.db.get(id);
    if (!member) throw new ConvexError('Membre introuvable.');
    if (member.email === me.email) throw new ConvexError('Vous ne pouvez pas changer votre propre rôle.');
    await ctx.db.patch(id, { role });
  },
});

/** Access ends at once: every server call re-checks the role. */
export const remove = mutation({
  args: { id: v.id('team') },
  handler: async (ctx, { id }) => {
    const me = await requireAdmin(ctx);
    const member = await ctx.db.get(id);
    if (!member) return;
    if (member.email === me.email) throw new ConvexError('Vous ne pouvez pas vous retirer vous-même.');
    await ctx.db.delete(id);
  },
});
