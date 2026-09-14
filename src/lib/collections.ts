/**
 * « Bonnes affaires » — saved filters over the catalogue, not categories.
 * A piece is never filed here; it simply matches or it doesn't, so these
 * pages can't go stale. The price and promo pages are worth indexing;
 * discount tiers and curated tags are for browsing.
 */
export type Collection = {
  slug: string;
  title: string;
  intro: string;
  indexable: boolean;
  filter: {
    maxPrice?: number;
    minDiscount?: number;
    onSale?: boolean;
    tag?: string;
    sort?: 'recent' | 'priceAsc' | 'priceDesc';
  };
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'promotions',
    title: 'Promotions',
    intro: 'Toutes les pièces dont le prix a baissé par rapport au prix d’origine. Le pourcentage est affiché sur chaque fiche.',
    indexable: true,
    filter: { onSale: true, sort: 'recent' },
  },
  {
    slug: 'moins-de-30-dt',
    title: 'Moins de 30 DT',
    intro: 'Des vêtements, chaussures et accessoires à moins de 30 dinars, livraison partout en Tunisie.',
    indexable: true,
    filter: { maxPrice: 30_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-de-50-dt',
    title: 'Moins de 50 DT',
    intro: 'Le meilleur de la seconde main sous la barre des 50 dinars.',
    indexable: true,
    filter: { maxPrice: 50_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-de-100-dt',
    title: 'Moins de 100 DT',
    intro: 'Pièces de marque et belles trouvailles à moins de 100 dinars.',
    indexable: true,
    filter: { maxPrice: 100_000, sort: 'priceAsc' },
  },
  {
    slug: 'moins-20',
    title: '-20 % et plus',
    intro: 'Au moins 20 % de remise par rapport au prix d’origine.',
    indexable: false,
    filter: { minDiscount: 20, sort: 'recent' },
  },
  {
    slug: 'moins-30',
    title: '-30 % et plus',
    intro: 'Au moins 30 % de remise par rapport au prix d’origine.',
    indexable: false,
    filter: { minDiscount: 30, sort: 'recent' },
  },
  {
    slug: 'moins-50',
    title: '-50 % et plus',
    intro: 'La moitié du prix d’origine, ou moins.',
    indexable: false,
    filter: { minDiscount: 50, sort: 'recent' },
  },
  {
    slug: 'dernieres-pieces',
    title: 'Dernières pièces',
    intro: 'Les pièces qu’il ne faut pas laisser passer : elles sont signalées par nos soins.',
    indexable: false,
    filter: { tag: 'Dernière pièce', sort: 'recent' },
  },
  {
    slug: 'meilleures-ventes',
    title: 'Meilleures ventes',
    intro: 'Les styles qui partent le plus vite, sélectionnés par l’équipe.',
    indexable: false,
    filter: { tag: 'Meilleure vente', sort: 'recent' },
  },
  {
    slug: 'nouveautes',
    title: 'Nouveautés',
    intro: 'Les dernières pièces ajoutées, les plus récentes en premier.',
    indexable: true,
    filter: { sort: 'recent' },
  },
];

export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug) ?? null;

/** Tags the admin can set. The last two feed the curated collections above. */
export const KNOWN_TAGS = ['Coup de cœur', 'Nouveau dépôt', 'Vintage', 'Meilleure vente', 'Dernière pièce'];
