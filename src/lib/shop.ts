/** Shop-wide constants and formatters. The one place to change a fee or a label. */

export const SHOP_NAME = 'BuonaFortuna';
export const SITE_URL = 'https://buonafortuna.vercel.app';
/** Preview image for pages that have no photo of their own (home, about). */
export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=630&fit=crop';

/**
 * Contact details shown on the about page and the thank-you page. Leave empty
 * until the real numbers exist — nothing is rendered for an empty value.
 * Phone as digits only, e.g. '20123456'.
 */
export const CONTACT_PHONE = '';
export const CONTACT_EMAIL = '';
export const INSTAGRAM_HANDLE = '';

/** WhatsApp deep link for a Tunisian number, or null when there is none. */
export function whatsappLink(phone: string, text?: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const url = `https://wa.me/216${digits}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

/** Flat delivery fee, in millimes. */
export const DELIVERY_FEE = 7000;

/** Tunisia's 24 governorates, for the order form. */
export const GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba',
  'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
  'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
] as const;

/** Four grades for second-hand pieces, plus "Neuf" for new goods (beauty). */
export const CONDITIONS = ['Comme neuf', 'Très bon état', 'Bon état', 'Satisfaisant', 'Neuf'] as const;
export type Condition = (typeof CONDITIONS)[number];
export const isSecondHand = (c: Condition | string) => c !== 'Neuf';

export type ProductStatus = 'available' | 'reserved' | 'sold';
export type OrderStatus = 'new' | 'confirmed' | 'delivered' | 'cancelled';

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  sold: 'Vendu',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Nouvelle',
  confirmed: 'Confirmée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

/** Millimes → "68 DT". Whole dinars unless there are millimes to show. */
export function formatPrice(millimes: number): string {
  const dinars = millimes / 1000;
  const text = Number.isInteger(dinars)
    ? String(dinars)
    : dinars.toFixed(3).replace('.', ',').replace(/0+$/, '');
  return `${text} DT`;
}

/** Percentage saved against the original price, or null when there is none. */
export function discountPercent(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** Tunisian mobile/landline: 8 digits, optional +216 / 00216 prefix, spaces allowed. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s.-]/g, '').replace(/^(\+|00)216/, '');
  return /^[2-9]\d{7}$/.test(digits) ? digits : null;
}

/** "trench-beige-sandro-38" from "Trench beige Sandro" + "38". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
