/**
 * Catalogue filters and the URL that carries them: ?etat ?taille ?budget ?tri ?q.
 * The pages that list products read them here and the rail that writes the
 * links uses the same constants, so the two can't drift apart.
 */
import { CONDITIONS, type Condition } from './shop';

/** Budget brackets in dinars: `?budget=30`. */
export const BUDGETS = [30, 50, 100] as const;

export const SORTS = [
  { key: 'recent', label: 'Nouveautés', value: 'recent' },
  { key: 'prix-asc', label: 'Moins cher', value: 'priceAsc' },
  { key: 'prix-desc', label: 'Plus cher', value: 'priceDesc' },
] as const;

/** Query string → args for `api.products.catalogue`, invalid values dropped. */
export function readFilters(params: URLSearchParams, { sizes: withSizes }: { sizes: boolean }) {
  const conditions = params.getAll('etat').filter((c): c is Condition => (CONDITIONS as readonly string[]).includes(c));
  const sizes = withSizes ? params.getAll('taille') : [];
  const budget = Number(params.get('budget'));
  const sort = SORTS.find((s) => s.key === params.get('tri')) ?? SORTS[0];
  return {
    q: params.get('q')?.trim() || undefined,
    conditions: conditions.length ? conditions : undefined,
    sizes: sizes.length ? sizes : undefined,
    maxPrice: (BUDGETS as readonly number[]).includes(budget) ? budget * 1000 : undefined,
    sort: sort.value,
  };
}
