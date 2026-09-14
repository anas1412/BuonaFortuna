import { ConvexError, v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import { isUnder, loadTree, pathAncestors, type CategoryNode } from './categories';
import { requireAdmin, slugify, uniqueProductSlug } from './lib';
import { condition, productImage, productStatus } from './schema';

const sortKey = v.union(v.literal('recent'), v.literal('priceAsc'), v.literal('priceDesc'));

/** Attach the category chain so pages can render breadcrumbs without extra queries. */
async function withCategory(ctx: QueryCtx | MutationCtx, p: Doc<'products'>) {
  const category = await ctx.db.get(p.categoryId);
  let ancestors: Doc<'categories'>[] = [];
  if (category) {
    const found = await Promise.all(
      pathAncestors(category.path).map((path) =>
        ctx.db
          .query('categories')
          .withIndex('by_path', (q) => q.eq('path', path))
          .unique(),
      ),
    );
    ancestors = found.filter((c): c is Doc<'categories'> => Boolean(c));
  }
  return { ...p, category, ancestors };
}

function discountOf(p: Doc<'products'>) {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

// ---- public -------------------------------------------------------------

/**
 * The catalogue, category pages and the "bonnes affaires" collections all go
 * through here. Sold pieces are left out (their pages stay live). Filtering
 * is in memory: one shop's stock is a few hundred rows, so an index per filter
 * combination would be ceremony.
 */
export const catalogue = query({
  args: {
    categoryPath: v.optional(v.string()),
    conditions: v.optional(v.array(condition)),
    sizes: v.optional(v.array(v.string())),
    q: v.optional(v.string()),
    sort: v.optional(sortKey),
    // Collections
    maxPrice: v.optional(v.number()),
    minDiscount: v.optional(v.number()),
    onSale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tree = await loadTree(ctx);
    const byId = new Map(tree.map((c) => [c._id, c]));

    let category: CategoryNode | null = null;
    if (args.categoryPath) {
      category = tree.find((c) => c.path === args.categoryPath) ?? null;
      if (!category) return { products: [], category: null, sizes: [] };
    }

    const all = (await ctx.db.query('products').collect()).filter((p) => p.status !== 'sold');
    const inScope = category
      ? all.filter((p) => {
          const c = byId.get(p.categoryId);
          return c ? isUnder(c.path, category!.path) : false;
        })
      : all;

    // Facet values come from what is actually on sale in this scope.
    const sizes = [...new Set(inScope.map((p) => p.size))].sort((a, b) =>
      a.localeCompare(b, 'fr', { numeric: true }),
    );

    const q = args.q?.trim().toLowerCase();
    const list = inScope.filter((p) => {
      if (args.conditions?.length && !args.conditions.includes(p.condition)) return false;
      if (args.sizes?.length && !args.sizes.includes(p.size)) return false;
      if (args.maxPrice !== undefined && p.price > args.maxPrice) return false;
      if (args.minDiscount !== undefined && discountOf(p) < args.minDiscount) return false;
      if (args.onSale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (byId.get(p.categoryId)?.name.toLowerCase().includes(q) ?? false)
      );
    });

    switch (args.sort ?? 'recent') {
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => b.createdAt - a.createdAt);
    }

    return {
      category,
      sizes,
      products: list.map((p) => ({ ...p, category: byId.get(p.categoryId) ?? null })),
    };
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    return p ? withCategory(ctx, p) : null;
  },
});

/** Same leaf first, then the same department, then anything on sale. Never the piece itself. */
export const similar = query({
  args: { productId: v.id('products'), limit: v.optional(v.number()) },
  handler: async (ctx, { productId, limit = 4 }) => {
    const self = await ctx.db.get(productId);
    if (!self) return [];
    const tree = await loadTree(ctx);
    const byId = new Map(tree.map((c) => [c._id, c]));
    const selfCat = byId.get(self.categoryId);
    const dept = selfCat?.path.split('/')[0];

    const onSale = (await ctx.db.query('products').collect()).filter(
      (p) => p._id !== productId && p.status !== 'sold',
    );
    const rank = (p: Doc<'products'>) => {
      if (p.categoryId === self.categoryId) return 0;
      const c = byId.get(p.categoryId);
      return c && dept && c.path.split('/')[0] === dept ? 1 : 2;
    };
    return onSale
      .sort((a, b) => rank(a) - rank(b) || b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const latest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) =>
    ctx.db
      .query('products')
      .withIndex('by_status', (q) => q.eq('status', 'available'))
      .order('desc')
      .take(limit),
});

/** For the sitemap: every product page that should exist, sold ones included. */
export const allSlugs = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('products').collect();
    return rows.map((p) => ({ slug: p.slug, updatedAt: p._creationTime }));
  },
});

// ---- admin --------------------------------------------------------------

export const adminList = query({
  args: { status: v.optional(productStatus) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    const rows = status
      ? await ctx.db
          .query('products')
          .withIndex('by_status', (q) => q.eq('status', status))
          .order('desc')
          .collect()
      : (await ctx.db.query('products').collect()).sort((a, b) => b.createdAt - a.createdAt);
    const cats = await ctx.db.query('categories').collect();
    const byId = new Map(cats.map((c) => [c._id, c]));
    return rows.map((p) => ({ ...p, category: byId.get(p.categoryId) ?? null }));
  },
});

export const adminGet = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return ctx.db.get(id);
  },
});

const productFields = {
  name: v.string(),
  brand: v.string(),
  size: v.string(),
  condition,
  categoryId: v.id('categories'),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  description: v.string(),
  images: v.array(productImage),
  status: productStatus,
};

/** Products are filed in leaves only; a rayon or department is not a place. */
async function assertLeaf(ctx: MutationCtx, categoryId: Doc<'categories'>['_id']) {
  const cat = await ctx.db.get(categoryId);
  if (!cat) throw new ConvexError('Catégorie introuvable.');
  const child = await ctx.db
    .query('categories')
    .withIndex('by_parent', (q) => q.eq('parentId', categoryId))
    .first();
  if (child) throw new ConvexError('Choisissez une sous-catégorie précise (le dernier niveau).');
}

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.images.length) throw new ConvexError('Ajoutez au moins une photo.');
    await assertLeaf(ctx, args.categoryId);
    const slug = await uniqueProductSlug(ctx, slugify(`${args.name} ${args.size}`));
    return ctx.db.insert('products', { ...args, slug, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { id: v.id('products'), ...productFields },
  handler: async (ctx, { id, ...args }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError('Article introuvable.');
    if (!args.images.length) throw new ConvexError('Ajoutez au moins une photo.');
    await assertLeaf(ctx, args.categoryId);
    // Keep the URL stable unless the name or size changed — links out there keep working.
    const renamed = existing.name !== args.name || existing.size !== args.size;
    const slug = renamed
      ? await uniqueProductSlug(ctx, slugify(`${args.name} ${args.size}`), id)
      : existing.slug;
    await ctx.db.patch(id, { ...args, slug });
  },
});

export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const p = await ctx.db.get(id);
    if (!p) return;
    for (const img of p.images) {
      if (img.storageId) await ctx.storage.delete(img.storageId);
    }
    await ctx.db.delete(id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Turn a finished upload into the {url, storageId} the product stores. */
export const imageFromUpload = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new ConvexError("Le fichier n'a pas été trouvé.");
    return { url, storageId };
  },
});
