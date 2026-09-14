/**
 * The category tree the client asked for: Département › Rayon › Type.
 * Every leaf exists so the admin can file a piece anywhere; leaves with nothing
 * in stock stay out of menus and the sitemap until something is added.
 *
 * Maquillage was four levels deep in the brief (Teint › Fond de teint…); the
 * site is three, so those groups are flattened into Maquillage — every leaf kept.
 */
export type SeedNode = { name: string; intro?: string; children?: SeedNode[] };

const leaves = (names: string[]): SeedNode[] => names.map((name) => ({ name }));

// ---- Femme ----------------------------------------------------------------
const femmeVetements = [
  'Robes', 'Pulls & T-shirts', 'Chemises', 'Gilets', 'Sweats & Hoodies', 'Vestes & Blazers',
  'Manteaux & Trenchs', 'Jupes', 'Pantalons', 'Shorts', 'Combinaisons', 'Ensembles',
  'Vêtements de sport', 'Vêtements de plage',
];
const femmeChaussures = [
  'Baskets', 'Sneakers', 'Sandales', 'Talons', 'Bottines', 'Bottes', 'Mocassins', 'Ballerines',
  'Claquettes & Mules',
];
const femmeSacs = [
  'Sacs à main', 'Sacs bandoulière', 'Sacs à dos', 'Sacs banane', 'Pochettes', 'Mini-sacs',
  'Sacs de soirée', 'Sacs de voyage',
];
const femmeBijoux = ['Colliers', 'Bracelets', 'Bagues', "Boucles d'oreilles", 'Parures', 'Montres'];
const femmeAccessoires = [
  'Foulards', 'Écharpes', 'Ceintures', 'Chapeaux', 'Casquettes', 'Lunettes de soleil',
  'Portefeuilles', 'Porte-cartes', 'Accessoires cheveux',
];

// ---- Enfants --------------------------------------------------------------
const fille = [
  'Robes', 'Ensembles', 'T-shirts & Pulls', 'Chemises', 'Gilets', 'Sweats', 'Pantalons', 'Jeans',
  'Jupes', 'Shorts', 'Vestes & Manteaux', 'Pyjamas', 'Vêtements de sport',
];
const garcon = [
  'T-shirts', 'Chemises', 'Polos', 'Pulls & Gilets', 'Sweats', 'Pantalons', 'Jeans', 'Shorts',
  'Ensembles', 'Vestes & Manteaux', 'Pyjamas', 'Vêtements de sport',
];
const chaussuresEnfants = ['Baskets', 'Sandales', 'Bottes', 'Chaussures habillées', 'Chaussures de sport'];
const accessoiresEnfants = ['Sacs', 'Casquettes', 'Chapeaux', 'Accessoires cheveux', 'Lunettes'];

// ---- Beauté ---------------------------------------------------------------
const maquillage = [
  // Teint
  'Fond de teint', 'BB & CC Cream', 'Correcteurs', 'Poudres', 'Blush', 'Bronzer', 'Highlighter',
  // Yeux
  'Mascara', 'Eyeliner', 'Crayons yeux', 'Fards à paupières', 'Palettes',
  // Lèvres
  'Rouge à lèvres', 'Gloss', 'Crayons à lèvres', 'Baumes',
  // Autres
  'Sourcils', 'Démaquillants', 'Sets & Coffrets maquillage',
];
const soinsVisage = [
  'Nettoyants', 'Démaquillants', 'Toniques', 'Sérums', 'Crèmes hydratantes', 'Crèmes anti-âge',
  'Contour des yeux', 'Masques', 'Protection solaire',
];
const soinsCorps = ['Laits corporels', 'Crèmes', 'Gommages', 'Huiles', 'Déodorants', 'Soins des mains', 'Soins des pieds'];
const cheveux = ['Shampoings', 'Après-shampoings', 'Masques', 'Huiles', 'Sérums', 'Soins anti-chute', 'Produits coiffants'];
const parfums = ['Parfums femme', 'Parfums homme', 'Eau de parfum', 'Eau de toilette', 'Brumes', 'Parfums cheveux', 'Coffrets parfums'];

// ---- Homme ----------------------------------------------------------------
const hommeVetements = [
  'T-shirts', 'Polos', 'Chemises', 'Pulls', 'Sweats', 'Vestes', 'Blousons', 'Manteaux', 'Jeans',
  'Pantalons', 'Shorts', 'Ensembles', 'Vêtements de sport',
];
const hommeChaussures = ['Sneakers', 'Baskets', 'Mocassins', 'Chaussures habillées', 'Sandales', 'Bottes', 'Claquettes'];
const hommeAccessoires = ['Sacs', 'Portefeuilles', 'Ceintures', 'Casquettes', 'Lunettes', 'Montres', 'Bijoux'];

export const seedTree: SeedNode[] = [
  {
    name: 'Femme',
    intro:
      "Robes, manteaux, sacs, chaussures et bijoux de seconde main, chinés un par un. Chaque pièce est unique, contrôlée et photographiée telle qu'elle est vendue.",
    children: [
      { name: 'Vêtements', intro: 'Des pièces de seconde main pour la garde-robe féminine, sélectionnées pour leur état et leur coupe.', children: leaves(femmeVetements) },
      { name: 'Chaussures', intro: 'Baskets, bottines, sandales et talons d’occasion, nettoyés et vérifiés. Pointures précises sur chaque fiche.', children: leaves(femmeChaussures) },
      { name: 'Sacs', intro: 'Sacs à main, bandoulières et pochettes de seconde main, du quotidien au soir.', children: leaves(femmeSacs) },
      { name: 'Bijoux', intro: 'Colliers, bracelets, bagues et montres d’occasion, vérifiés et photographiés de près.', children: leaves(femmeBijoux) },
      { name: 'Accessoires', intro: 'Foulards, ceintures, chapeaux et lunettes pour finir une tenue sans se ruiner.', children: leaves(femmeAccessoires) },
    ],
  },
  {
    name: 'Enfants',
    intro:
      "Vêtements, chaussures et accessoires pour enfants en très bon état, à petits prix. Ils grandissent vite : les habits n'ont pas à finir au fond d'un tiroir.",
    children: [
      { name: 'Fille', intro: 'Robes, ensembles et essentiels de seconde main pour les filles.', children: leaves(fille) },
      { name: 'Garçon', intro: 'T-shirts, jeans et vestes de seconde main pour les garçons.', children: leaves(garcon) },
      { name: 'Chaussures enfants', intro: 'Baskets, sandales et bottes pour enfants, vérifiées et à la bonne pointure.', children: leaves(chaussuresEnfants) },
      { name: 'Accessoires enfants', intro: 'Sacs, casquettes et petits accessoires pour les enfants.', children: leaves(accessoiresEnfants) },
    ],
  },
  {
    name: 'Beauté',
    intro:
      'Maquillage, soins, cheveux et parfums. Des produits neufs, sélectionnés et livrés partout en Tunisie, payés à la réception.',
    children: [
      { name: 'Maquillage', intro: 'Teint, yeux et lèvres : le maquillage du quotidien et des grands soirs.', children: leaves(maquillage) },
      { name: 'Soins visage', intro: 'Nettoyer, hydrater, protéger : les soins du visage au bon prix.', children: leaves(soinsVisage) },
      { name: 'Soins corps', intro: 'Laits, crèmes, gommages et huiles pour le corps.', children: leaves(soinsCorps) },
      { name: 'Cheveux', intro: 'Shampoings, masques et soins pour tous les types de cheveux.', children: leaves(cheveux) },
      { name: 'Parfums', intro: 'Eaux de parfum, eaux de toilette et coffrets, pour elle et pour lui.', children: leaves(parfums) },
    ],
  },
  {
    name: 'Homme',
    intro:
      'Chemises, jeans, vestes et sneakers de seconde main pour homme, sélectionnés pour leur état et leur coupe.',
    children: [
      { name: 'Vêtements', intro: 'Les essentiels masculins de seconde main, du t-shirt au manteau.', children: leaves(hommeVetements) },
      { name: 'Chaussures', intro: 'Sneakers, mocassins et bottes d’occasion, nettoyés et vérifiés.', children: leaves(hommeChaussures) },
      { name: 'Accessoires', intro: 'Sacs, ceintures, montres et lunettes pour homme.', children: leaves(hommeAccessoires) },
    ],
  },
];

/** Where each seed product lives in the tree. Keys are product slugs. */
export const seedProductPaths: Record<string, string> = {
  'trench-beige-sandro-38': 'femme/vetements/manteaux-et-trenchs',
  'robe-fleurie-zara-m': 'femme/vetements/robes',
  'chemisier-en-soie-36': 'femme/vetements/chemises',
  'jean-501-delave-levi-s-31-32': 'homme/vetements/jeans',
  'chemise-a-carreaux-flanelle-l': 'homme/vetements/chemises',
  'baskets-new-balance-574-42': 'homme/chaussures/baskets',
  'bottines-en-cuir-39': 'femme/chaussures/bottines',
  'sac-a-main-cuir-vintage-taille-unique': 'femme/sacs/sacs-a-main',
  'robe-cocktail-annees-60-36': 'femme/vetements/robes',
  'blouson-en-cuir-motard-m': 'homme/vetements/blousons',
  'body-de-naissance-en-coton-bio-3-mois': 'enfants/fille/ensembles',
  'survetement-adidas-originals-l': 'homme/vetements/vetements-de-sport',
};
