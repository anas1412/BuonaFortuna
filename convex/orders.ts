import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireStaff } from './lib';
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
    await requireStaff(ctx);
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
    await requireStaff(ctx);
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
    await requireStaff(ctx);
    const order = await ctx.db.get(id);
    if (!order) throw new ConvexError('Commande introuvable.');
    const now = Date.now();
    await ctx.db.patch(id, {
      status,
      ...(status === 'confirmed' && { confirmedAt: now }),
      ...(status === 'delivered' && { deliveredAt: now }),
    });

    const productStatus =
      status === 'delivered' ? 'sold' : status === 'cancelled' ? 'available' : 'reserved';
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (p) await ctx.db.patch(p._id, { status: productStatus });
    }
  },
});

/** The « À appeler » badge in the menu and on the Commandes tabs. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const fresh = await ctx.db.query('orders').withIndex('by_status', (q) => q.eq('status', 'new')).collect();
    return { newOrders: fresh.length };
  },
});

const DAY = 86_400_000;
const TUNIS = 3_600_000; // UTC+1 all year, no DST
const dayKey = (ms: number) => new Date(ms + TUNIS).toISOString().slice(0, 10);
/** Midnight Tunis time on the 1st of the month `offset` months from `ms`. */
function monthStart(ms: number, offset = 0) {
  const d = new Date(ms + TUNIS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1) - TUNIS;
}

/**
 * Everything on the Accueil page in one read. Sales count items only: the
 * delivery fee goes to the courier. Money is « encaissé » on delivery.
 * ponytail: scans every order and product on each read; fine for one shop's volume, add per-day rollups if it grows to thousands.
 */
export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const [orders, products, categories] = await Promise.all([
      ctx.db.query('orders').collect(),
      ctx.db.query('products').collect(),
      ctx.db.query('categories').collect(),
    ]);
    const now = Date.now();
    const items = (o: (typeof orders)[number]) => o.items.reduce((s, i) => s + i.price, 0);
    const deliveredAt = (o: (typeof orders)[number]) => o.deliveredAt ?? o.createdAt;
    const delivered = orders.filter((o) => o.status === 'delivered');

    function period(from: number, to: number) {
      const placed = orders.filter((o) => o.createdAt >= from && o.createdAt < to);
      const kept = placed.filter((o) => o.status !== 'cancelled');
      return {
        revenue: delivered.filter((o) => deliveredAt(o) >= from && deliveredAt(o) < to).reduce((s, o) => s + items(o), 0),
        orders: placed.length,
        avgBasket: kept.length ? Math.round(kept.reduce((s, o) => s + items(o), 0) / kept.length) : null,
        cancelRate: placed.length ? (placed.length - kept.length) / placed.length : null,
      };
    }
    const thisMonth = monthStart(now);

    // Sales received per day, the last 30 days, oldest first.
    const days = Array.from({ length: 30 }, (_, i) => ({ day: dayKey(now - (29 - i) * DAY), revenue: 0, orders: 0 }));
    const byDay = new Map(days.map((d) => [d.day, d]));
    for (const o of delivered) {
      const d = byDay.get(dayKey(deliveredAt(o)));
      if (d) {
        d.revenue += items(o);
        d.orders += 1;
      }
    }

    // How long a piece waits between listing and its order, and which rayons sell.
    const productById = new Map(products.map((p) => [p._id, p]));
    const categoryById = new Map(categories.map((c) => [c._id, c]));
    const byPath = new Map(categories.map((c) => [c.path, c]));
    const waits: number[] = [];
    const rayonSales = new Map<string, number>();
    for (const o of delivered) {
      for (const it of o.items) {
        const p = productById.get(it.productId);
        if (!p) continue;
        waits.push((o.createdAt - p.createdAt) / DAY);
        const path = categoryById.get(p.categoryId)?.path.split('/').slice(0, 2).join('/');
        if (path) rayonSales.set(path, (rayonSales.get(path) ?? 0) + 1);
      }
    }
    const topRayons = [...rayonSales]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, sold]) => {
        const [dept] = path.split('/');
        return { path, name: [byPath.get(dept)?.name, byPath.get(path)?.name].filter(Boolean).join(' › '), sold };
      });

    const count = (s: string) => products.filter((p) => p.status === s).length;
    return {
      month: period(thisMonth, now + 1),
      lastMonth: period(monthStart(now, -1), thisMonth),
      days,
      stock: {
        available: count('available'),
        drafts: count('draft'),
        reserved: count('reserved'),
        sold: count('sold'),
        addedThisMonth: products.filter((p) => p.createdAt >= thisMonth).length,
        avgDaysToSell: waits.length ? Math.round((waits.reduce((a, b) => a + b, 0) / waits.length) * 10) / 10 : null,
      },
      topRayons,
      toCall: orders.filter((o) => o.status === 'new').length,
      stuck: orders
        .filter((o) => o.status === 'confirmed' && (o.confirmedAt ?? o.createdAt) < now - 3 * DAY)
        .map((o) => ({ _id: o._id, number: o.number, name: o.customer.name, days: Math.floor((now - (o.confirmedAt ?? o.createdAt)) / DAY) })),
      recent: [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    };
  },
});
