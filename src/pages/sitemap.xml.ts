import type { APIRoute } from 'astro';
import { COLLECTIONS } from '../lib/collections';
import { api, convex } from '../lib/convex';
import { SITE_URL } from '../lib/shop';

/**
 * Built from the database on request. Category pages appear only once they
 * have stock; product pages stay listed after selling (they stay live);
 * only the indexable collections are included.
 */
export const GET: APIRoute = async () => {
  const [tree, products] = await Promise.all([
    convex.query(api.categories.tree, {}),
    convex.query(api.products.allSlugs, {}),
  ]);

  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: '/', priority: '1.0' },
    { loc: '/catalogue', priority: '0.9' },
    { loc: '/bonnes-affaires', priority: '0.7' },
    { loc: '/a-propos', priority: '0.5' },
    ...tree
      .filter((c) => c.count > 0)
      .map((c) => ({ loc: `/c/${c.path}`, priority: c.level === 1 ? '0.9' : c.level === 2 ? '0.8' : '0.7' })),
    ...COLLECTIONS.filter((c) => c.indexable).map((c) => ({ loc: `/bonnes-affaires/${c.slug}`, priority: '0.6' })),
    ...products.map((p) => ({
      loc: `/p/${p.slug}`,
      lastmod: new Date(p.updatedAt).toISOString().slice(0, 10),
      priority: '0.7',
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${SITE_URL}${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<priority>${u.priority}</priority></url>`,
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
  });
};
