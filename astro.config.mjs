// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// Server-rendered: product availability changes hourly, and the sitemap and
// order flow both need live data. Vercel's adapter runs it as functions.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],
  site: 'https://buonafortuna.vercel.app',
});
