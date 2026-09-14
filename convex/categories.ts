import { v } from 'convex/values';
import { query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query('categories').collect();
    return cats.sort((a, b) => a.order - b.order);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db
      .query('categories')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique(),
});
