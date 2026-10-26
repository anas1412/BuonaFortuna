// Run by `bun run check`. Fails loudly if URL parsing or the size table breaks.
import assert from 'node:assert/strict';
import { readFilters } from './filters';
import { applyDiscount, discountPercent } from './shop';
import { hasSizeFacet, orderSizes, sizeScale } from './sizes';

const f = readFilters(new URLSearchParams('etat=Bon%20état&etat=Faux&taille=M&budget=50&tri=prix-asc&q=%20robe%20'), { sizes: true });
assert.deepEqual(f, { q: 'robe', conditions: ['Bon état'], sizes: ['M'], maxPrice: 50_000, sort: 'priceAsc' });
assert.deepEqual(readFilters(new URLSearchParams('taille=M&budget=7&tri=nope'), { sizes: false }), {
  q: undefined, conditions: undefined, sizes: undefined, maxPrice: undefined, sort: 'recent',
});

assert.equal(hasSizeFacet('femme'), false);
assert.equal(hasSizeFacet('femme/chaussures'), true);

// Scales resolve from any depth; beauty and unlisted rayons are free text.
assert.equal(sizeScale('enfants/chaussures-enfants/baskets').label, 'Pointure');
assert.deepEqual(sizeScale('homme/chaussures').values, ['39', '40', '41', '42', '43', '44', '45', '46', '47']);
assert.deepEqual(sizeScale('femme/sacs/pochettes').values, ['Taille unique']);
assert.deepEqual(sizeScale('beaute/parfums'), { label: 'Format', values: null });
assert.equal(sizeScale('femme/lingerie').values, null);

// The rail follows the scale's order, off-scale values last.
assert.deepEqual(orderSizes(['L', 'Vieux 31/32', '38', 'M'], sizeScale('femme/vetements')), ['38', 'M', 'L', 'Vieux 31/32']);

// Batch discounts: from the barré, half-dinar rounding, badge matches the %, removal restores.
// trench at 68 with barré 240 is already −72 %: −30 % must not raise it to 168
assert.deepEqual(applyDiscount(68_000, 240_000, 30), { price: 68_000, compareAtPrice: 240_000 });
const c = applyDiscount(15_000, undefined, 30); // shirt 15 → 10,5
assert.deepEqual(c, { price: 10_500, compareAtPrice: 15_000 });
assert.deepEqual(applyDiscount(c.price, c.compareAtPrice, 30), c); // −30 twice is still −30
assert.deepEqual(applyDiscount(c.price, c.compareAtPrice, 50), { price: 7_500, compareAtPrice: 15_000 }); // deeper: from the barré
assert.equal(discountPercent(c.price, c.compareAtPrice), 30);
assert.deepEqual(applyDiscount(c.price, c.compareAtPrice, null), { price: 15_000, compareAtPrice: undefined });
assert.deepEqual(applyDiscount(15_000, undefined, null), { price: 15_000, compareAtPrice: undefined });
assert.equal(applyDiscount(600, undefined, 50).price, 500); // never below 0,5 DT
