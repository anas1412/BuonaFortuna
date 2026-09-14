import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const condition = v.union(
  v.literal('Comme neuf'),
  v.literal('Très bon état'),
  v.literal('Bon état'),
  v.literal('Satisfaisant'),
);

/**
 * Every piece is one of a kind, so stock is a status, not a quantity.
 * available → reserved (ordered, not yet delivered) → sold. Cancelling an
 * order returns the piece to available.
 */
export const productStatus = v.union(
  v.literal('available'),
  v.literal('reserved'),
  v.literal('sold'),
);

export const orderStatus = v.union(
  v.literal('new'),
  v.literal('confirmed'),
  v.literal('delivered'),
  v.literal('cancelled'),
);

export const productImage = v.object({
  url: v.string(),
  // Present for photos uploaded through the dashboard; seed images are plain URLs.
  storageId: v.optional(v.id('_storage')),
});

export default defineSchema({
  ...authTables,

  // Sequential order numbers. Mutations are transactional, so read-then-write is safe.
  counters: defineTable({
    name: v.string(),
    value: v.number(),
  }).index('by_name', ['name']),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.number(),
    // A real paragraph for the category page — thin pages don't rank.
    intro: v.string(),
  }).index('by_slug', ['slug']),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    brand: v.string(),
    size: v.string(),
    condition,
    categoryId: v.id('categories'),
    // Millimes. 68 DT = 68000.
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    description: v.string(),
    images: v.array(productImage),
    status: productStatus,
    tag: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status', 'createdAt'])
    .index('by_category', ['categoryId', 'status']),

  orders: defineTable({
    // Human-readable, sequential: BF-0001. What the customer hears on the phone.
    number: v.string(),
    // Always one entry today. Kept as a list so a cart later changes nothing here.
    items: v.array(
      v.object({
        productId: v.id('products'),
        name: v.string(),
        price: v.number(),
        image: v.string(),
      }),
    ),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      city: v.string(),
      address: v.string(),
    }),
    note: v.optional(v.string()),
    deliveryFee: v.number(),
    status: orderStatus,
    paymentMethod: v.literal('cod'),
    createdAt: v.number(),
  })
    .index('by_status', ['status', 'createdAt'])
    .index('by_number', ['number']),
});
