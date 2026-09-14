# BuonaFortuna

Friperie en ligne pour la Tunisie. Pièces uniques, paiement à la livraison.
Astro (server-rendered) + Convex, deployed on Vercel. See `PLAN.md` for scope, design and progress.

## Run locally

```sh
bun install
bunx convex dev        # terminal 1 — pushes convex/ to the dev deployment, writes .env.local
bun run dev            # terminal 2 — http://localhost:4321
```

Admin at `/admin`. Only emails in the Convex `ADMIN_EMAIL` env var can sign in or create an account.

## Deploy

- **Site**: push `main` → Vercel builds. Vercel needs `CONVEX_URL` (production).
- **Backend**: `bunx convex deploy` pushes `convex/` to production. Convex changes never deploy from Vercel.
- **Seed** (first run only): `bunx convex run --prod seed:run`

## Checks

```sh
bun run build
bunx astro check       # needs TypeScript 6.x (pinned as a dev dependency)
```
