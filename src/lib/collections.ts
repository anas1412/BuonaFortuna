/**
 * « Bonnes affaires » — saved filters over the catalogue, not categories.
 * A piece is never filed here; it simply matches or it doesn't, so these
 * pages can't go stale and nobody maintains them. The same rule that puts a
 * piece here paints the discount badge on its card.
 */
export type Collection = {
  slug: string;
  title: string;
  intro: string;
  /** Promo pages are worth indexing; discount tiers are for browsing. */
  indexable: boolean;
  group: 'remise' | 'nouveau';
  filter: {
    minDiscount?: number;
    onSale?: boolean;
  };
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'nouveautes',
    title: 'Nouveautés',
    intro: 'Les dernières pièces ajoutées, les plus récentes en premier.',
    indexable: true,
    group: 'nouveau',
    filter: {},
  },
  {
    slug: 'promotions',
    title: 'Promotions',
    intro: 'Toutes les pièces dont le prix a baissé par rapport au prix d’origine. La remise est affichée sur chaque fiche.',
    indexable: true,
    group: 'remise',
    filter: { onSale: true },
  },
  {
    slug: 'moins-20',
    title: '-20 % et plus',
    intro: 'Au moins 20 % de remise par rapport au prix d’origine.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 20 },
  },
  {
    slug: 'moins-30',
    title: '-30 % et plus',
    intro: 'Au moins 30 % de remise par rapport au prix d’origine.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 30 },
  },
  {
    slug: 'moins-50',
    title: '-50 % et plus',
    intro: 'La moitié du prix d’origine, ou moins.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 50 },
  },
];

export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug) ?? null;
