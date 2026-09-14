import { ConvexError, v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import { requireAdmin, slugify } from './lib';

export type CategoryNode = Doc<'categories'> & {
  /** Pieces on sale (available or reserved) in this node and everything beneath it. */
  count: number;
};

/** Is `node` the same as or beneath `ancestorPath`? */
export function isUnder(nodePath: string, ancestorPath: string) {
  return nodePath === ancestorPath || nodePath.startsWith(ancestorPath + '/');
}

/**
 * Every category with its live stock count rolled up from the leaves.
 * A few hundred rows: one read, computed in memory, no per-node queries.
 */
export async function loadTree(ctx: QueryCtx | MutationCtx): Promise<CategoryNode[]> {
  const [cats, products] = await Promise.all([
    ctx.db.query('categories').collect(),
    ctx.db.query('products').collect(),
  ]);
  const byId = new Map(cats.map((c) => [c._id, c]));
  const counts = new Map<Id<'categories'>, number>();
  for (const p of products) {
    if (p.status === 'sold') continue;
    let node: Doc<'categories'> | undefined = byId.get(p.categoryId);
    while (node) {
      counts.set(node._id, (counts.get(node._id) ?? 0) + 1);
      node = node.parentId ? byId.get(node.parentId) : undefined;
    }
  }
  return cats
    .map((c) => ({ ...c, count: counts.get(c._id) ?? 0 }))
    .sort((a, b) => a.level - b.level || a.order - b.order || a.name.localeCompare(b.name, 'fr'));
}

export const tree = query({
  args: {},
  handler: async (ctx) => loadTree(ctx),
});

export const byPath = query({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    const node = await ctx.db
      .query('categories')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();
    if (!node) return null;
    const all = await loadTree(ctx);
    const me = all.find((c) => c._id === node._id)!;
    const ancestors = pathAncestors(path)
      .map((p) => all.find((c) => c.path === p))
      .filter((c): c is CategoryNode => Boolean(c));
    const children = all.filter((c) => c.parentId === node._id);
    return { ...me, ancestors, children };
  },
});

/** "a/b/c" → ["a", "a/b"] */
export function pathAncestors(path: string) {
  const parts = path.split('/');
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'));
}

// ---- admin --------------------------------------------------------------

export const create = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id('categories')),
    intro: v.optional(v.string()),
  },
  handler: async (ctx, { name, parentId, intro }) => {
    await requireAdmin(ctx);
    const clean = name.trim();
    if (!clean) throw new ConvexError('Le nom est obligatoire.');

    const parent = parentId ? await ctx.db.get(parentId) : null;
    if (parentId && !parent) throw new ConvexError('Catégorie parente introuvable.');
    const level = parent ? parent.level + 1 : 1;
    if (level > 3) throw new ConvexError('Trois niveaux maximum : département, rayon, type.');

    const slug = slugify(clean) || 'categorie';
    const path = parent ? `${parent.path}/${slug}` : slug;
    const clash = await ctx.db
      .query('categories')
      .withIndex('by_path', (q) => q.eq('path', path))
      .unique();
    if (clash) throw new ConvexError('Une catégorie avec ce nom existe déjà à cet endroit.');

    const siblings = await ctx.db
      .query('categories')
      .withIndex('by_parent', (q) => q.eq('parentId', parentId))
      .collect();
    const order = siblings.reduce((m, s) => Math.max(m, s.order), 0) + 1;

    return ctx.db.insert('categories', {
      name: clean,
      slug,
      path,
      level,
      parentId,
      order,
      intro: intro?.trim() || undefined,
    });
  },
});

/** Rename or rewrite the intro. The slug and path stay — links out there keep working. */
export const update = mutation({
  args: { id: v.id('categories'), name: v.optional(v.string()), intro: v.optional(v.string()) },
  handler: async (ctx, { id, name, intro }) => {
    await requireAdmin(ctx);
    const cat = await ctx.db.get(id);
    if (!cat) throw new ConvexError('Catégorie introuvable.');
    const patch: Partial<Doc<'categories'>> = {};
    if (name !== undefined) {
      if (!name.trim()) throw new ConvexError('Le nom est obligatoire.');
      patch.name = name.trim();
    }
    if (intro !== undefined) patch.intro = intro.trim() || undefined;
    await ctx.db.patch(id, patch);
  },
});

/**
 * Delete a category. With `cascade`, its whole subtree goes too — but only if
 * no product anywhere beneath (sold ones included) still points at it, since
 * a sold piece's page keeps linking its category.
 */
export const remove = mutation({
  args: { id: v.id('categories'), cascade: v.optional(v.boolean()) },
  handler: async (ctx, { id, cascade = false }) => {
    await requireAdmin(ctx);
    const node = await ctx.db.get(id);
    if (!node) throw new ConvexError('Catégorie introuvable.');

    const all = await ctx.db.query('categories').collect();
    const subtree = all.filter((c) => isUnder(c.path, node.path));
    const descendants = subtree.filter((c) => c._id !== id);

    if (descendants.length && !cascade) {
      throw new ConvexError('Cette catégorie contient des sous-catégories.');
    }

    const ids = new Set(subtree.map((c) => c._id));
    const products = await ctx.db.query('products').collect();
    const inside = products.filter((p) => ids.has(p.categoryId));
    if (inside.length) {
      const sold = inside.filter((p) => p.status === 'sold').length;
      throw new ConvexError(
        `${inside.length} article${inside.length > 1 ? 's' : ''} ${inside.length > 1 ? 'sont rangés' : 'est rangé'} ici` +
          (sold ? ` (dont ${sold} vendu${sold > 1 ? 's' : ''}, dont la page reste en ligne)` : '') +
          '. Déplacez-les d’abord.',
      );
    }

    // Deepest first, so no row is ever left pointing at a missing parent.
    for (const c of [...subtree].sort((a, b) => b.level - a.level)) {
      await ctx.db.delete(c._id);
    }
    return subtree.length;
  },
});
