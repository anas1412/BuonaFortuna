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
  // Dev only: pre-bundle the admin's libraries at startup. Found lazily on the
  // first /admin visit, they trigger a re-bundle that breaks open pages
  // (« Outdated Optimize Dep », « _jsxDEV is not a function »).
  vite: {
    optimizeDeps: {
      include: ['convex/react', '@convex-dev/auth/react', 'react-router', 'react/jsx-dev-runtime', 'react-dom/client'],
    },
  },
});
