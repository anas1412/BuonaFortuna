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

## v2.1 — price is a filter, not a collection

User decision (2026-10-26): the « Moins de 30/50/100 DT » collections covered the whole shop, so « robes under 30 DT » was impossible. Price moves into the catalogue rail.

- [x] Rail gets a **Budget** group (Moins de 30 / 50 / 100 DT), `?budget=30`, on catalogue, category and collection pages
- [x] Drop the three budget collections; home tile shows Nouveautés · Promotions · -30 % · -50 %
- [x] Old `/bonnes-affaires/moins-de-*-dt` URLs → 301 to `/catalogue?budget=*`
- [x] Build + check pass; verified in the browser on dev
- [x] Home: department cards are bare links (no heading, counts or sub-links); category tiles and rail show no counts
- [x] Desktop rail was never visible (closed `<details>`); `::details-content` shows it at ≥900px, phones still fold it
- [x] Filters unified in `src/lib/filters.ts` (URL vocabulary, budgets, sorts, size facet rules); pages and rail read from it. `bun run check` runs `filters.check.ts`
- [x] Sort moved out of the rail to a bar above the grid (Nouveautés · Moins cher · Plus cher); « Effacer les filtres » keeps the sort
- [x] Size facet only inside a rayon (one kind of size there), labelled Pointure / Format / Taille; hidden when a single value
- [x] **Sizes are a fixed table** (`src/lib/sizes.ts`), French sizing per rayon: femme 34–48 + XS–XXL, homme XS–3XL + 38–54, enfants Naissance → 16 ans, pointures femme 35–42 / homme 39–47 / enfants 16–38, sacs·bijoux·accessoires « Taille unique », beauté free text (Format). Drives the admin dropdown, rail order and labels. Rayons added later in the admin fall back to free text until added to the table
- [ ] Admin form not yet checked in the browser (needs a login): rayon first, then the size dropdown; an old off-table size shows as « (ancienne saisie) »
- [x] Brand optional (« Marque (facultatif) »): stored as empty string, no schema change; card, product page, JSON-LD, order page and admin list skip it when empty. Empty case not yet seen in the browser (needs an admin-created product)
- [x] `seed:fixPlaceholders` (dry run by default, `'{"apply": true}'` to write): off-table sizes → table (31/32 → 40, slug regenerated), « Vintage » brand → empty. Applied on **dev** and verified; seed data corrected too
- [x] Same on **prod** (2026-10-26): `bunx convex deploy`, dry run, apply — same 2 changes, rerun clean. Live site needs the new code pushed (old code shows « · 36 » on the brandless card)
- [ ] Ask the client: does she convert UK/US/IT labels to French sizes when listing? (the table assumes yes)

## v2.2 — team and roles

User decision (2026-10-26): staff are invited from the admin, with two roles. No email invites (no mail service): an admin adds the address, the person creates their account at /admin/connexion.

| | Administrateur | Gestionnaire |
|---|---|---|
| Articles: add, edit, photos, prices (incl. prix d'origine) | ✓ | ✓ |
| Commandes: view, change status | ✓ | ✓ |
| Supprimer un article | ✓ | — |
| Catégories | ✓ | — |
| Équipe (add, change role, remove) | ✓ | — |

- `ADMIN_EMAIL` stays as the **owner** list: always Administrateur, shown on Équipe but can't be removed or demoted (no lock-out).
- New `team` table (email, role). Sign-up/sign-in allowed for owners + team.
- The server re-reads the role on **every** call (`requireStaff` / `requireAdmin` in `convex/lib.ts`), so removing someone takes effect immediately; their admin shows « Accès retiré ».
- Staff may set prices and discounts (default; reversible: make prix d'origine admin-only).

- [x] Backend: `team` table, `convex/team.ts` (me, list, add, setRole, remove), role checks on every function, auth consults the team list
- [x] Admin: Équipe page, menu and Supprimer buttons by role, admin-only routes, « Accès retiré » screen
- [x] anasbassoumi@gmail.com is an owner on dev and prod (already in ADMIN_EMAIL on both; prod also has helaismail0@gmail.com)
- [x] Checked on dev in the browser: Équipe add / duplicate refused / role change / remove; anonymous call rejected; product form sizes per rayon and empty-brand save
- [x] Deployed 2026-10-26: Convex prod (team table + index), then pushed 73478fb; live admin bundle has the Équipe route, no console errors
- [ ] Not tested: a real Gestionnaire session (needs a second account)

## v2.3 — admin redesign

Users have never used a back office, and will mostly work from a phone (photo → listing). Goal: obvious, calm, consistent; one way to do each thing.

**Audit (2026-10-26, 375px and 1280px)**
- Phone: the top bar takes a third of the screen (menu wraps to 2 rows, then email, role, boutique link, logout stacked).
- Phone: tables squeeze — names wrap over 3 lines, columns collide. Same order table is copied in Dashboard and Orders.
- Phone: status tabs wrap into a broken two-row pill.
- Phone: product form keeps two fields per row (Nom / Marque cut off); Enregistrer sits at the very bottom.
- Phone: order detail puts the actions (confirm, cancel) last; calling the customer is a small text link.
- Everywhere: 12–14px text, 36px buttons, 14 inline styles, three different "small button" looks, empty/loading states are bare text.

**Rules**
- Phone-first, one breakpoint (900px). Touch targets ≥ 44px on phones.
- Shell: desktop keeps the sidebar; phone gets a slim top bar (logo + account menu) and a fixed bottom tab bar with icons (Accueil, Commandes, Articles, + Catégories/Équipe for admins).
- One page header: title, optional subtitle, one primary action. Back link on detail pages.
- Lists: tables on desktop, the same rows become cards on phones (CSS only). One shared order list.
- Forms: one column on phones, actions in a sticky bar at the bottom.
- Buttons: primary (red, one per screen), secondary (outline), danger (outline red, always two-step). Base text 15px, numbers tabular.
- States: loading skeleton, empty state that says what will appear and what to do.
- No inline styles; icons are one inline SVG set with one stroke width.

- [x] Foundation: `src/admin/ui.tsx` (PageHead, Tabs, Empty, Loading, Icon), one stylesheet system in admin.css
- [x] Shell: phone top bar + bottom tab bar with icons; sidebar with icons; account menu (closes on tap outside / navigation)
- [x] Lists: shared `OrderList`; rows are real links; tables → cards on phones (CSS); status tabs scroll sideways
- [x] Forms and detail: photos first and sticky save bar on phones; order detail with Appeler/WhatsApp buttons and « Que faire ? » first; categories no longer overflow; 24 h times; zero inline styles
- [x] Verified on 375 (no horizontal overflow on any route) and 1280; login checked live at 375 after deploy (pushed 9db4859, 2026-10-26)

## v2.4 — dashboard statistics

User decision (2026-10-26): the Accueil page becomes a real dashboard. Only data the shop already records (no visitor tracking: the site has none).

- **Ce mois-ci vs le mois dernier** (months in Tunis time): ventes encaissées (delivered orders, items only — delivery fees go to the courier), commandes, panier moyen, taux d'annulation (refusals cost money with cash on delivery).
- **Chart**: sales received per day, last 30 days. Inline SVG, one series in brand red (validated), thin bars, hover/focus tooltip, a « Voir les chiffres » table twin.
- **Stock**: en vente / réservés / vendus, pièces ajoutées ce mois, délai moyen de vente (order date − listing date).
- **Meilleurs rayons**: top rayons by pieces sold.
- **À traiter**: orders to call, and confirmed orders not delivered after 3 days (likely stuck with the courier).
- Orders get optional `confirmedAt` / `deliveredAt`, set on status change; older orders fall back to `createdAt`.
- Stat-tile figures use the body sans with proportional digits (dataviz rule), not the display serif.

- [x] Backend: `confirmedAt`/`deliveredAt` set on status change; `orders.dashboard`; `orders.stats` slimmed to the badge count
- [x] UI: KPIs with deltas, chart (hover tooltip) + « Voir les chiffres », stock, rayons, à traiter, recent orders; empty states, no fake data. Tested end to end on dev with test order BF-0002 (new → confirmed → delivered); dev product « Body de naissance » is now sold
- [x] Verified phone + desktop; Convex prod deployed, then pushed 845c6ef (2026-10-26); live bundle checked, shop pages 200

## v2.5 — discounts and batch actions

**Discount model (kept: it's the common one, Shopify's « compare-at price »).** The admin enters the selling price and, only for a real markdown, the **prix barré**. The badge is `round((barré − prix) / barré × 100)`. Never typed by hand, so card, product page and « Promotions » always agree.
- Form: rename « Prix d'origine » → « Prix barré (avant remise) », live « Remise affichée : −30 % » preview, refuse a barré ≤ prix (was silently ignored).
- Not a « prix neuf » field: showing a retail price as a discount on every second-hand piece would make every piece look « en promo » and is misleading.

**Batch actions on Articles.** Tick rows (or all shown), then one bar:
- Statut → En vente / Réservé / Vendu (staff)
- Remise → −10 / −20 / −30 / −50 %, or « Retirer la remise » (staff). Computed from the barré when there is one, so −30 twice is still −30, not −51. Never raises a price: a piece already cheaper than the % asked is left as is and the screen says how many. Prices round to the half-dinar, so the badge matches the % chosen (whole dinars made a 15 DT piece at −30 % read −27 %).
- Supprimer (admins only, two-step), photos included.

- [x] Form: prix barré label, live %, validation (client and server)
- [x] Backend: `products.bulkStatus`, `bulkDiscount` (maths in `applyDiscount`, covered by `bun run check`), `bulkRemove`
- [ ] Articles: checkboxes + batch bar (desktop + phone)
- [ ] Verified on dev; deployed (Convex first)

## Out of scope

Cart · online payment · buyer accounts · **multivendor** · Arabic · reviews · custom domain · automatic best-sellers ranking
