import { ConvexError, v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { requireAdmin, slugify, uniqueProductSlug } from './lib';
import { condition, productImage, productStatus } from './schema';

const sortKey = v.union(
  v.literal('recent'),
  v.literal('priceAsc'),
  v.literal('priceDesc'),
);

/** Attach the category so pages can render breadcrumbs without a second query. */
async function withCategory(ctx: { db: any }, p: Doc<'products'>) {
  const category = await ctx.db.get(p.categoryId);
  return { ...p, category };
}

// ---- public -------------------------------------------------------------

/**
 * The catalogue. Sold pieces are left out here (their pages stay live), and
 * the whole thing is filtered in memory: a single shop's stock is a few hundred
 * rows at most, so an index per filter combination would be ceremony.
 */
export const catalogue = query({
  args: {
    categorySlug: v.optional(v.string()),
    conditions: v.optional(v.array(condition)),
    sizes: v.optional(v.array(v.string())),
    q: v.optional(v.string()),
    sort: v.optional(sortKey),
  },
  handler: async (ctx, args) => {
    let category: Doc<'categories'> | null = null;
    if (args.categorySlug) {
      category = await ctx.db
        .query('categories')
        .withIndex('by_slug', (q) => q.eq('slug', args.categorySlug!))
        .unique();
      if (!category) return { products: [], category: null, sizes: [] };
    }

    const all = (await ctx.db.query('products').collect()).filter((p) => p.status !== 'sold');
    const inCategory = category ? all.filter((p) => p.categoryId === category!._id) : all;

    // Facet values come from what is actually on sale in this category.
    const sizes = [...new Set(inCategory.map((p) => p.size))].sort((a, b) =>
      a.localeCompare(b, 'fr', { numeric: true }),
    );

    const q = args.q?.trim().toLowerCase();
    let list = inCategory.filter((p) => {
      if (args.conditions?.length && !args.conditions.includes(p.condition)) return false;
      if (args.sizes?.length && !args.sizes.includes(p.size)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
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

    const cats = await ctx.db.query('categories').collect();
    const byId = new Map(cats.map((c) => [c._id, c]));
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

/** Same category first, then anything else on sale. Never the piece itself. */
export const similar = query({
  args: { productId: v.id('products'), limit: v.optional(v.number()) },
  handler: async (ctx, { productId, limit = 4 }) => {
    const self = await ctx.db.get(productId);
    if (!self) return [];
    const onSale = (await ctx.db.query('products').collect()).filter(
      (p) => p._id !== productId && p.status !== 'sold',
    );
    const same = onSale.filter((p) => p.categoryId === self.categoryId);
    const rest = onSale.filter((p) => p.categoryId !== self.categoryId);
    return [...same, ...rest].slice(0, limit);
  },
});

export const latest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const rows = await ctx.db
      .query('products')
      .withIndex('by_status', (q) => q.eq('status', 'available'))
      .order('desc')
      .take(limit);
    return rows;
  },
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
  tag: v.optional(v.string()),
};

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.images.length) throw new ConvexError('Ajoutez au moins une photo.');
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
