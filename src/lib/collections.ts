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
  /** Price and promo pages are worth indexing; discount tiers are for browsing. */
  indexable: boolean;
  group: 'budget' | 'remise' | 'nouveau';
  filter: {
    maxPrice?: number;
    minDiscount?: number;
    onSale?: boolean;
    sort?: 'recent' | 'priceAsc' | 'priceDesc';
  };
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'nouveautes',
    title: 'Nouveautés',
    intro: 'Les dernières pièces ajoutées, les plus récentes en premier.',
    indexable: true,
    group: 'nouveau',
    filter: { sort: 'recent' },
  },
  {
    slug: 'promotions',
    title: 'Promotions',
    intro: 'Toutes les pièces dont le prix a baissé par rapport au prix d’origine. La remise est affichée sur chaque fiche.',
    indexable: true,
    group: 'remise',
    filter: { onSale: true, sort: 'recent' },
  },
  {
    slug: 'moins-de-30-dt',
    title: 'Moins de 30 DT',
    intro: 'Des vêtements, chaussures et accessoires à moins de 30 dinars, livraison partout en Tunisie.',
    indexable: true,
    group: 'budget',
    filter: { maxPrice: 30_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-de-50-dt',
    title: 'Moins de 50 DT',
    intro: 'Le meilleur de la seconde main sous la barre des 50 dinars.',
    indexable: true,
    group: 'budget',
    filter: { maxPrice: 50_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-de-100-dt',
    title: 'Moins de 100 DT',
    intro: 'Pièces de marque et belles trouvailles à moins de 100 dinars.',
    indexable: true,
    group: 'budget',
    filter: { maxPrice: 100_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-20',
    title: '-20 % et plus',
    intro: 'Au moins 20 % de remise par rapport au prix d’origine.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 20, sort: 'recent' },
  },
  {
    slug: 'moins-30',
    title: '-30 % et plus',
    intro: 'Au moins 30 % de remise par rapport au prix d’origine.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 30, sort: 'recent' },
  },
  {
    slug: 'moins-50',
    title: '-50 % et plus',
    intro: 'La moitié du prix d’origine, ou moins.',
    indexable: false,
    group: 'remise',
    filter: { minDiscount: 50, sort: 'recent' },
  },
];

export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug) ?? null;
