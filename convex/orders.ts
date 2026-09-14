import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAdmin } from './lib';
import { orderStatus } from './schema';

// ---- public -------------------------------------------------------------

/**
 * Placing an order. Runs as one transaction: check the piece is still
 * available, mark it reserved, take the next order number, write the order.
 * Two customers racing for the same coat can't both win.
 */
export const create = mutation({
  args: {
    productSlug: v.string(),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      city: v.string(),
      address: v.string(),
    }),
    note: v.optional(v.string()),
    deliveryFee: v.number(),
  },
  handler: async (ctx, { productSlug, customer, note, deliveryFee }) => {
    const product = await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', productSlug))
      .unique();
    if (!product) throw new ConvexError('Cet article n’existe plus.');
    if (product.status !== 'available') {
      throw new ConvexError('Cet article vient d’être réservé par quelqu’un d’autre.');
    }

    await ctx.db.patch(product._id, { status: 'reserved' });

    const counter = await ctx.db
      .query('counters')
      .withIndex('by_name', (q) => q.eq('name', 'orders'))
      .unique();
    const next = (counter?.value ?? 0) + 1;
    if (counter) await ctx.db.patch(counter._id, { value: next });
    else await ctx.db.insert('counters', { name: 'orders', value: next });

    const number = `BF-${String(next).padStart(4, '0')}`;
    const id = await ctx.db.insert('orders', {
      number,
      items: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.url ?? '',
        },
      ],
      customer,
      note: note?.trim() || undefined,
      deliveryFee,
      status: 'new',
      paymentMethod: 'cod',
      createdAt: Date.now(),
    });
    return { id, number };
  },
});

/** The thank-you page. The id is unguessable, so this is safe to expose. */
export const confirmation = query({
  args: { id: v.id('orders') },
  handler: async (ctx, { id }) => {
    const o = await ctx.db.get(id);
    if (!o) return null;
    return {
      number: o.number,
      items: o.items,
      deliveryFee: o.deliveryFee,
      customerName: o.customer.name,
      city: o.customer.city,
      createdAt: o.createdAt,
    };
  },
});

// ---- admin --------------------------------------------------------------

export const list = query({
  args: { status: v.optional(orderStatus) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    if (status) {
      return ctx.db
        .query('orders')
        .withIndex('by_status', (q) => q.eq('status', status))
        .order('desc')
        .collect();
    }
    const all = await ctx.db.query('orders').collect();
    return all.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id('orders') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return ctx.db.get(id);
  },
});

/**
 * Moving an order along also moves its piece:
 * delivered → sold, cancelled → available again, anything else → stays reserved.
 */
export const setStatus = mutation({
  args: { id: v.id('orders'), status: orderStatus },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(id);
    if (!order) throw new ConvexError('Commande introuvable.');
    await ctx.db.patch(id, { status });

    const productStatus =
      status === 'delivered' ? 'sold' : status === 'cancelled' ? 'available' : 'reserved';
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (p) await ctx.db.patch(p._id, { status: productStatus });
    }
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [orders, products] = await Promise.all([
      ctx.db.query('orders').collect(),
      ctx.db.query('products').collect(),
    ]);
    const count = <T extends { status: string }>(rows: T[], s: string) =>
      rows.filter((r) => r.status === s).length;
    return {
      newOrders: count(orders, 'new'),
      confirmedOrders: count(orders, 'confirmed'),
      available: count(products, 'available'),
      reserved: count(products, 'reserved'),
      sold: count(products, 'sold'),
      recent: orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    };
  },
});
