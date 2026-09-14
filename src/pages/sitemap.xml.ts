import type { APIRoute } from 'astro';
import { api, convex } from '../lib/convex';
import { SITE_URL } from '../lib/shop';

/**
 * Built from the database on request, so a piece added in the dashboard is in
 * the sitemap a second later. Sold pieces stay listed: their pages stay live.
 */
export const GET: APIRoute = async () => {
  const [categories, products] = await Promise.all([
    convex.query(api.categories.list, {}),
    convex.query(api.products.allSlugs, {}),
  ]);

  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: '/', priority: '1.0' },
    { loc: '/catalogue', priority: '0.9' },
    { loc: '/a-propos', priority: '0.5' },
    ...categories.map((c) => ({ loc: `/c/${c.slug}`, priority: '0.8' })),
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
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
