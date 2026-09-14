import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, type MutationCtx } from './_generated/server';
import { slugify } from './lib';
import { seedProducts } from './seedData';
import { seedProductPaths, seedTree, seedVintageSlugs, type SeedNode } from './seedTree';

/**
 * Walk the tree and make sure every node exists. Idempotent — matching is by
 * path, so running it again after adding a subtree only creates what's missing.
 */
async function ensureTree(ctx: MutationCtx): Promise<Map<string, Id<'categories'>>> {
  // Rows written before the tree existed have no path; they must not enter the map,
  // or their ids would look like leaves and their products would be skipped.
  const existing = (await ctx.db.query('categories').collect()).filter((c) => typeof c.path === 'string' && c.path);
  const idByPath = new Map(existing.map((c) => [c.path, c._id]));
  let created = 0;

  async function walk(nodes: SeedNode[], parentPath: string | null, parentId: Id<'categories'> | undefined, level: number) {
    for (const [i, node] of nodes.entries()) {
      const slug = slugify(node.name) || 'categorie';
      const path = parentPath ? `${parentPath}/${slug}` : slug;
      let id = idByPath.get(path);
      if (!id) {
        id = await ctx.db.insert('categories', {
          name: node.name,
          slug,
          path,
          level,
          parentId,
          order: i + 1,
          intro: node.intro,
        });
        idByPath.set(path, id);
        created++;
      }
      if (node.children) await walk(node.children, path, id, level + 1);
    }
  }
  await walk(seedTree, null, undefined, 1);
  console.log(`tree: ${created} categories created, ${idByPath.size} total`);
  return idByPath;
}

/**
 * Fresh install: the tree plus the demo products.
 * `bunx convex run seed:run` — does nothing to products if any already exist.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const idByPath = await ensureTree(ctx);
    const anyProduct = await ctx.db.query('products').first();
    if (anyProduct) return 'tree ensured; products already present';

    const now = Date.now();
    let i = 0;
    for (const p of seedProducts) {
      const categoryId = idByPath.get(seedProductPaths[p.slug] ?? '');
      if (!categoryId) continue;
      await ctx.db.insert('products', {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        size: p.size,
        condition: p.condition as Doc<'products'>['condition'],
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        description: p.description,
        images: p.images.map((url) => ({ url })),
        status: 'available',
        tag: seedVintageSlugs.includes(p.slug) ? 'Vintage' : p.tag,
        createdAt: now - i++ * 3_600_000,
      });
    }
    return `seeded tree + ${seedProducts.length} products`;
  },
});

/**
 * One-off migration from the original 8 flat categories to the tree:
 * build the tree, move each product to its leaf, delete the flat rows.
 * Safe to re-run: products already in a leaf are left alone.
 */
export const migrateCategoriesV2 = internalMutation({
  args: {},
  handler: async (ctx) => {
    const idByPath = await ensureTree(ctx);
    const leafIds = new Set(idByPath.values());

    const products = await ctx.db.query('products').collect();
    let moved = 0;
    for (const p of products) {
      if (leafIds.has(p.categoryId)) continue;
      const path = seedProductPaths[p.slug];
      const target = path ? idByPath.get(path) : undefined;
      if (!target) {
        console.warn(`no target leaf for ${p.slug}; left as is`);
        continue;
      }
      await ctx.db.patch(p._id, {
        categoryId: target,
        tag: seedVintageSlugs.includes(p.slug) ? 'Vintage' : p.tag,
      });
      moved++;
    }

    // Flat categories are the ones with no path (written before this schema).
    const all = await ctx.db.query('categories').collect();
    let deleted = 0;
    for (const c of all) {
      if ((c as { path?: string }).path === undefined) {
        await ctx.db.delete(c._id);
        deleted++;
      }
    }
    return `moved ${moved} products, deleted ${deleted} flat categories`;
  },
});
