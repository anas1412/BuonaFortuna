import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

/**
 * Server-side Convex client for Astro pages. Plain HTTP, one request per
 * query — exactly what a server-rendered page wants. The React admin island
 * uses the reactive client instead and gets the URL as a prop.
 */
export function convexUrl(): string {
  const url = process.env.CONVEX_URL ?? import.meta.env.CONVEX_URL;
  if (!url) {
    throw new Error(
      'CONVEX_URL is not set. Locally it comes from .env.local (written by `bunx convex dev`); on Vercel set it in the project environment.',
    );
  }
  return url;
}

export const convex = new ConvexHttpClient(convexUrl());
export { api };
