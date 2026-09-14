import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { ConvexError } from 'convex/values';
import { api, convex } from '../lib/convex';
import { DELIVERY_FEE, GOVERNORATES, normalizePhone } from '../lib/shop';

/**
 * The only write the public site ever makes: placing an order.
 * Runs on the server from a plain HTML <form method="POST">, so it works
 * with JavaScript disabled. Validation here is the safety net; the form's
 * HTML attributes give the fast feedback.
 */
export const server = {
  order: defineAction({
    accept: 'form',
    input: z.object({
      productSlug: z.string().min(1),
      name: z.string().trim().min(2, 'Indiquez votre nom complet.').max(80),
      phone: z
        .string()
        .trim()
        .refine((v) => normalizePhone(v) !== null, 'Numéro tunisien à 8 chiffres attendu, ex. 20 123 456.'),
      city: z.enum(GOVERNORATES, { message: 'Choisissez votre gouvernorat.' }),
      address: z.string().trim().min(6, 'Précisez la rue, le quartier ou un repère.').max(240),
      note: z.string().trim().max(500).optional(),
    }),
    handler: async (input) => {
      try {
        const { id } = await convex.mutation(api.orders.create, {
          productSlug: input.productSlug,
          customer: {
            name: input.name,
            phone: normalizePhone(input.phone)!,
            city: input.city,
            address: input.address,
          },
          note: input.note || undefined,
          deliveryFee: DELIVERY_FEE,
        });
        return { id };
      } catch (e) {
        // Convex tells us in French when the piece was reserved a moment ago.
        if (e instanceof ConvexError) {
          throw new ActionError({ code: 'CONFLICT', message: String(e.data) });
        }
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "La commande n'a pas pu être enregistrée. Réessayez dans un instant.",
        });
      }
    },
  }),
};
