# BuonaFortuna — website plan

Single-shop second-hand clothing site for Tunisia. Cash on delivery. SEO first.
This file is the source of truth for scope and progress — update the checklist as steps land.

## Hard scope decisions

- **Single vendor. No multivendor — not now, not designed for later.** No vendor/shop tables, no owner fields.
- No cart: every item is one of a kind, so *Commander* goes straight to the order form.
- No online payment. `paymentMethod` is always `cod`.
- No buyer accounts. Buyers are identified by phone number on the order.
- One admin login (allowlisted email). Staff can be added to the allowlist later.
- French only. Arabic/RTL is out.
- Bun for everything: `bun install`, `bun run`, `bunx`.

## Assumptions (change here if wrong)

| Assumption | Detail |
|---|---|
| Currency | Tunisian dinar, displayed `68 DT`. Stored as integer **millimes** |
| Delivery | All 24 governorates, flat **7 DT**. One constant in `src/lib/shop.ts` |
| Confirmation | Admin phones the customer before delivery: `nouvelle → confirmée → livrée` (or `annulée`) |
| Seed | 8 categories and the 12 products from the old app, Unsplash images |
| Domain | `buonafortuna.vercel.app` until a custom domain is added |

## Stack

| Layer | Choice |
|---|---|
| Shop pages | Astro, server-rendered (`output: 'server'`), `@astrojs/vercel` |
| Islands | React — product gallery and the admin only |
| Admin | React SPA mounted at `/admin/*` with `react-router` |
| Backend | Convex: database, file storage, auth (`@convex-dev/auth` password provider) |
| Styling | Plain CSS + custom properties. No Tailwind |
| TypeScript | `astro check` needs TS 6.x — TS 7 lacks the API it uses. Dev dep pinned to 6 |
| Fonts | Self-hosted `@fontsource/playfair-display`, `@fontsource-variable/inter` |
| Hosting | Vercel (existing project `buonafortuna`), Git integration on `main` |
| Convex | Two cloud deployments: dev `quaint-gnat-453` (build target) and prod `fantastic-raven-860` (site target). Team `anas-b`, project `buonafortuna` |

## Data model

```
categories  name · slug · order · intro
products    name · slug · brand · size · condition · categoryId · price · compareAtPrice?
            description · images[{url, storageId?}] · status · tag? · createdAt
orders      number (BF-0001) · items[{productId, name, price, image}]
            customer{name, phone, city, address} · note? · deliveryFee
            status · paymentMethod:'cod' · createdAt
```

- `condition`: `Comme neuf | Très bon état | Bon état | Satisfaisant`
- `products.status`: `available | reserved | sold` — **this is the inventory system**
- `orders.status`: `new | confirmed | delivered | cancelled`
- Creating an order flips the product to `reserved` **in the same mutation** (no double-sell).
  `delivered` → product `sold`. `cancelled` → product back to `available`.
- `items` is an array even though it always has one entry — a cart later costs nothing.

## Design

Brand unchanged: cream `#FFFCF9`, paper `#FFFFFF`, ink `#1A1512`, red `#D8232A`,
red-deep `#A5161C`, red-soft `#FBE1DF`, line `#F0E7E1`, gold `#E8A93A`, green `#2E7D5B`, amber `#C97A1A`.
Playfair Display for headlines, Inter for everything else.

Web-specific choices:
- One bold moment: the home hero — full-bleed ink band, Playfair 48px headline, product photos bleeding off the right edge. Everything else stays quiet.
- Hairline borders (`1px line`) instead of drop shadows on cards.
- Product images **4:5** (clothes are tall).
- Status visible: *Réservé* amber chip, *Vendu* ink chip, on card and page. Sold pages stay live with similar items below.
- Filters are **links with query params**, not JS. Crawlable, works with JS off.
- Max width 1120 · gutters 20 · catalogue rail 232.
- Type scale: h1 40 · h2 28 · card title 16 · body 15/24 · small 13. About-page line length under 70 chars.

## Pages

| Route | Content |
|---|---|
| `/` | Hero · 8 category tiles · *Nouveautés* (latest 8 available) · *Comment ça marche* (3 numbered steps) · footer |
| `/catalogue` | Rail (catégorie · état · taille · tri) + 4-col grid. `?q=` search |
| `/c/[slug]` | Catalogue pre-filtered, h1 = category, intro paragraph |
| `/p/[slug]` | Two columns: gallery left; brand, name, price, compare-at, discount, condition, size, description, delivery box, **Commander** right. Sold/reserved states. Similar items below. JSON-LD Product |
| `/commander/[slug]` | Order form: nom · téléphone · gouvernorat · adresse · note. Plain HTML POST, server-validated, works with JS off |
| `/merci/[id]` | Order number, "we call to confirm", summary. Uses the unguessable `_id`, never the sequential number |
| `/a-propos` | About · how delivery works · contact |
| `404` | — |
| `/sitemap.xml` · `/robots.txt` | Sitemap generated from Convex |

Order numbers `BF-0001` come from a `counters` table (transactional read-then-write).

## Admin `/admin`

| Screen | |
|---|---|
| `/admin/connexion` | Email + password. Sign-up only for the allowlisted email |
| `/admin` | Counts (nouvelles · disponibles · réservés · vendus) + latest orders, live |
| `/admin/produits` | List with status filter + search |
| `/admin/produits/nouveau`, `/admin/produits/:id` | Form: photos (multi-upload, first = cover), name, brand, size, condition, category, price, compareAt, description, tag, status |
| `/admin/commandes` | Tabs by status |
| `/admin/commandes/:id` | Customer, `tel:` + WhatsApp links, item, status buttons |

No native `prompt`/`confirm`/`alert` anywhere in the admin: renames and page texts edit in place (`Categories.tsx`), destructive actions use the inline two-step `ConfirmButton` (arms, then « Oui, … / Annuler », auto-resets after 5 s).

## SEO checklist

- [x] Per-page `<title>` and meta description
- [x] OpenGraph + Twitter card with product image (WhatsApp preview)
- [x] Canonical URLs
- [x] JSON-LD `Product` with `itemCondition: UsedCondition`, live `availability`, `priceCurrency: TND`
- [x] JSON-LD `BreadcrumbList` (+ `ClothingStore` on home)
- [x] Semantic HTML: one `<h1>`, `<article>`, real `<a href>` everywhere
- [x] `/sitemap.xml` from DB, `/robots.txt`
- [x] Self-hosted fonts, lazy images with width/height
- [x] Zero JS on catalogue/product pages — live product page has 4 `<script>`: 2 JSON-LD + gallery island runtime

## Deployment

1. Convex: `bunx convex dev --once --configure new` → dev deployment; `bunx convex deploy` → prod.
2. Convex env (both deployments): `SITE_URL`, `ADMIN_EMAIL` (comma-separated allowlist), `JWT_PRIVATE_KEY`, `JWKS`.
3. Vercel: preset Astro, env `CONVEX_URL` = prod deployment URL. Server code reads it and hands it to the admin island as a prop — no `PUBLIC_` duplicate.
4. Push `main` → Vercel builds. Convex changes deploy from CLI, not from Vercel.

## Progress

- [x] 1. Wipe Expo app, scaffold Astro, install deps (bun)
- [x] 2. Convex project: dev deployment `quaint-gnat-453`, schema, functions, seed (8 cat / 12 products)
- [x] 3. Tokens, global CSS, layout, header, footer
- [x] 4. Product page with full SEO head — verified with `curl` (title, canonical, og:image, JSON-LD Product/Offer/Breadcrumb)
- [x] 5. Catalogue + category pages (filters are links; filtered views noindex)
- [x] 6. Home, about, 404 (returns real 404 status)
- [x] 7. Order flow verified: 400 on bad phone, 303 → /merci, product → reserved, second order → 409. Actions enforce CSRF via Origin (curl needs `-H Origin`)
- [x] 8. Auth + admin — verified in browser on dev: sign-up (allowlisted), dashboard live counts, order Nouvelle → Confirmée → Livrée (product → sold), product form edit. Test email removed from dev allowlist; a leftover `test@buonafortuna.dev` user row exists on **dev** only
- [x] 9. Sitemap (from DB, 23 URLs on dev), robots
- [x] 10. **Live: https://buonafortuna.vercel.app** — Convex prod `fantastic-raven-860` deployed + env + seeded · Vercel `CONVEX_URL` set · pushed `4b17482`, Vercel built in 20s. Live product page: title, canonical, og:image, JSON-LD Product/Offer/Breadcrumb, InStock/TND/UsedCondition; sitemap 23 URLs
- [x] 11. Layout QA on the live site at 390 and 1280 (measured in-page): no horizontal overflow anywhere; nav on its own row under 480px; catalogue rail collapses to `<details>` on phones and shows 4 columns beside it on desktop; product page two columns ≥900px; order summary above the form on phones

## First login (you)

Go to https://buonafortuna.vercel.app/admin/connexion → « Première connexion ? Créer le compte » → your allowlisted email + a password (8+ chars). Only `ADMIN_EMAIL` on the prod deployment can do this. To add staff: `bunx convex env set --prod ADMIN_EMAIL "you@x,them@y"`.

## Known follow-ups (not blocking)

- Contact details are empty (`CONTACT_PHONE`, `CONTACT_EMAIL`, `INSTAGRAM_HANDLE` in `src/lib/shop.ts`) — nothing renders until set.
- Delivery fee is a constant (7 DT). Per-governorate fees would need a small table.
- HTML responses are `max-age=0`; a short `s-maxage` on catalogue/category pages would cut function invocations once traffic exists.
- Seed products use Unsplash photos; replace with real ones from the dashboard.

## v2 — category tree, collections (shipped)

Decisions taken (user said "implement what you told me"):
- **Three-level hierarchy**: Département › Rayon › Type. A product lives in exactly one leaf. Parent pages aggregate descendants. URLs are full paths: `/c/femme/vetements/robes`.
- **Every leaf seeded, hidden until stocked**: a category with no available/reserved product beneath it is out of menus and the sitemap and renders `noindex` with "bientôt" copy.
- **Beauté included** (client's list is authoritative). New goods → condition value **« Neuf »** (5th enum value, no new field): pages switch to `NewCondition` in JSON-LD and drop the second-hand wording; the size field doubles as format (« 50 ml », « Teinte 02 »). Maquillage's 4th level (Teint/Yeux/Lèvres) flattened into Maquillage — every leaf kept.
- **Bonnes affaires = saved filters**, not categories: `/bonnes-affaires/moins-de-30-dt`, `-50-dt`, `-100-dt`, `promotions`, `-20`, `-30`, `-50`, `nouveautes`. Defined in `src/lib/collections.ts`. Price/promo pages indexable. *Meilleures ventes* / *Dernières pièces* **dropped** with the tags (no honest automatic signal for one-of-a-kind stock; reversible if one appears).
- **No manual tags.** The `tag` field was removed (two-step: `seed:dropTags`, then schema). The card badge is automatic: the discount % when a piece has an original price — the same rule that fills the Bonnes affaires pages, so card and pages never disagree. « Vintage » is just a word in names/descriptions (search covers those).
- Migration: schema fields added optional → deploy → `seed:migrateCategoriesV2` (builds tree, remaps the 12 seed products, deletes flat categories) → fields made required → deploy. Done on dev and prod. Tree: 178 nodes (4 départements, 17 rayons, 157 types). Adding a subtree later = edit `seedTree.ts`, run `seed:run` (idempotent) — or add nodes in `/admin/categories`.
- Verified in the browser (dev admin): category manager add → rename → delete; product form picker prefills Département › Rayon › Type from the leaf; « Neuf » in conditions; tag suggestions.
- Verified live after deploy: header Femme | Enfants | Homme | Bonnes affaires; `/c/femme` tiles; `/c/beaute` noindex; collections; product breadcrumb JSON-LD chain; sitemap 41 URLs; old flat URLs 404 (site had ~1h of traffic-free life, redirects not worth it).
- Verified on dev: header shows stocked departments only; `/c/femme` tiles; `/c/femme/vetements/robes` breadcrumbs; `/c/beaute` noindex + « Bientôt »; collections filter; sitemap lists only stocked categories (20) + 5 indexable collections; product JSON-LD chain.
- Admin gets a category manager (`/admin/categories`: add leaf under a parent, rename, delete if empty) and a 3-step picker in the product form. Rename keeps slug/path (URLs stay stable).
- Header links = departments + Bonnes affaires; department/rayon pages show child tiles; rail shows the subtree for the current node.

## Out of scope

Cart · online payment · buyer accounts · **multivendor** · Arabic · reviews · custom domain · automatic best-sellers ranking
