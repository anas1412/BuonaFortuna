import type { Doc, Id } from './_generated/dataModel';
import { internalMutation } from './_generated/server';
import { seedCategories, seedProducts } from './seedData';

/**
 * First-run data: `bunx convex run seed:run`. Does nothing if categories
 * already exist, so it is safe to run twice.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('categories').first();
    if (existing) return 'already seeded';

    const idByKey = new Map<string, Id<'categories'>>();
    for (const c of seedCategories) {
      const id = await ctx.db.insert('categories', {
        name: c.name,
        slug: c.slug,
        order: c.order,
        intro: c.intro,
      });
      idByKey.set(c.key, id);
    }

    // Stagger createdAt so "Nouveautés" has a stable, sensible order.
    const now = Date.now();
    let i = 0;
    for (const p of seedProducts) {
      const categoryId = idByKey.get(p.categoryKey);
      if (!categoryId) continue;
      await ctx.db.insert('products', {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        size: p.size,
        // The JSON seed can't carry the literal union; the values are the four allowed ones.
        condition: p.condition as Doc<'products'>['condition'],
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        description: p.description,
        images: p.images.map((url) => ({ url })),
        status: 'available',
        tag: p.tag,
        createdAt: now - i++ * 3_600_000,
      });
    }
    return `seeded ${seedCategories.length} categories, ${seedProducts.length} products`;
  },
});
