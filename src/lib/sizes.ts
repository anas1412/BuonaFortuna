/**
 * Size scales by rayon, in French sizing: Tunisian friperies sell European
 * stock, and a piece with a UK/US/IT label is converted when it's listed.
 * One table drives the admin picker, the order in the rail and its label.
 */
export type SizeScale = { label: 'Taille' | 'Pointure' | 'Format'; values: readonly string[] | null };

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: (to - from) / step + 1 }, (_, i) => String(from + i * step));

const LETTERS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const KIDS = [
  'Naissance', '1 mois', '3 mois', '6 mois', '9 mois', '12 mois', '18 mois', '24 mois',
  '3 ans', '4 ans', '5 ans', '6 ans', '8 ans', '10 ans', '12 ans', '14 ans', '16 ans',
];
const ONE_SIZE: SizeScale = { label: 'Taille', values: ['Taille unique'] };

/** Keyed by rayon path (département/rayon). */
const SCALES: Record<string, SizeScale> = {
  'femme/vetements': { label: 'Taille', values: [...range(34, 48, 2), ...LETTERS] },
  'femme/chaussures': { label: 'Pointure', values: range(35, 42) },
  'femme/sacs': ONE_SIZE,
  'femme/bijoux': ONE_SIZE,
  'femme/accessoires': ONE_SIZE,
  'enfants/fille': { label: 'Taille', values: KIDS },
  'enfants/garcon': { label: 'Taille', values: KIDS },
  'enfants/chaussures-enfants': { label: 'Pointure', values: range(16, 38) },
  'enfants/accessoires-enfants': ONE_SIZE,
  'homme/vetements': { label: 'Taille', values: [...LETTERS, '3XL', ...range(38, 54, 2)] },
  'homme/chaussures': { label: 'Pointure', values: range(39, 47) },
  'homme/accessoires': ONE_SIZE,
};

/** The scale for a category at any depth. Beauty, and rayons not listed above, are free text. */
export function sizeScale(categoryPath: string): SizeScale {
  const rayon = categoryPath.split('/').slice(0, 2).join('/');
  return SCALES[rayon] ?? { label: categoryPath.startsWith('beaute') ? 'Format' : 'Taille', values: null };
}

/**
 * Sizes only mean something inside a rayon (Femme › Chaussures), where they are
 * all one kind. Above that, baby ages and shoe sizes would share a list.
 */
export const hasSizeFacet = (categoryPath?: string | null) => !!categoryPath?.includes('/');

/** Sizes in the scale's order; anything off the scale (older entries, formats) after. */
export function orderSizes(sizes: string[], scale: SizeScale) {
  const known = scale.values?.filter((v) => sizes.includes(v)) ?? [];
  const rest = sizes.filter((s) => !known.includes(s)).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  return [...known, ...rest];
}
