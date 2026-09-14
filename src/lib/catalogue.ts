import { CONDITIONS, type Condition } from './shop';

export type SortKey = 'recent' | 'priceAsc' | 'priceDesc';

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Nouveautés' },
  { key: 'priceAsc', label: 'Prix croissant' },
  { key: 'priceDesc', label: 'Prix décroissant' },
];

export interface CatalogueFilters {
  q: string;
  conditions: Condition[];
  sizes: string[];
  sort: SortKey;
}

/** Read the filters off the URL. Unknown values are dropped, not errors. */
export function readFilters(url: URL): CatalogueFilters {
  const sp = url.searchParams;
  const conditions = sp.getAll('etat').filter((c): c is Condition => (CONDITIONS as readonly string[]).includes(c));
  const sizes = sp.getAll('taille').filter(Boolean);
  const sortRaw = sp.get('tri');
  const sort: SortKey = sortRaw === 'priceAsc' || sortRaw === 'priceDesc' ? sortRaw : 'recent';
  return { q: sp.get('q')?.trim() ?? '', conditions, sizes, sort };
}

/**
 * Build the href for a filter link. Filters are links so the catalogue is
 * crawlable and works without JavaScript; this keeps every other filter
 * intact while toggling one value.
 */
export function filterHref(
  basePath: string,
  f: CatalogueFilters,
  change: Partial<{ toggleCondition: Condition; toggleSize: string; sort: SortKey; clear: true }>,
): string {
  const sp = new URLSearchParams();
  if (change.clear) return basePath;

  if (f.q) sp.set('q', f.q);

  let conditions = [...f.conditions];
  if (change.toggleCondition) {
    conditions = conditions.includes(change.toggleCondition)
      ? conditions.filter((c) => c !== change.toggleCondition)
      : [...conditions, change.toggleCondition];
  }
  conditions.forEach((c) => sp.append('etat', c));

  let sizes = [...f.sizes];
  if (change.toggleSize) {
    sizes = sizes.includes(change.toggleSize)
      ? sizes.filter((s) => s !== change.toggleSize)
      : [...sizes, change.toggleSize];
  }
  sizes.forEach((s) => sp.append('taille', s));

  const sort = change.sort ?? f.sort;
  if (sort !== 'recent') sp.set('tri', sort);

  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function hasActiveFilters(f: CatalogueFilters): boolean {
  return !!f.q || f.conditions.length > 0 || f.sizes.length > 0 || f.sort !== 'recent';
}
