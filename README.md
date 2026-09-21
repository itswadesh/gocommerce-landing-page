# kitcommerce.store

A static site. No build step, no package installation.

```
node serve.cjs      # http://127.0.0.1:4173
```

`serve.cjs` mirrors the two Cloudflare Pages behaviours the site depends on: a
directory serves its `index.html`, and an unmatched path serves `404.html` with
a 404 status. The second is currently *stricter* than production — see Hosting.

## What this site is

`kitcommerce.store` is **the website presenting two independent open-source
projects**. It is not itself a product.

| | GoCommerce | Svelte Commerce |
| --- | --- | --- |
| Role | Backend + admin | Storefront |
| Language | Go | SvelteKit |
| Standalone | Yes | Yes |
| Repository | `itswadesh/gocommerce` | `itswadesh/svelte-commerce` |
| Accent | Go blue `#00add8` | Svelte orange `#ff3e00` |

The site takes no hue of its own and the wordmark is monochrome, because a
website that wore one of the projects' colours would be claiming to be that
project.

### The branding rule

Do **not** reintroduce KitCommerce as a third product — no platform, framework,
engine, runtime, umbrella, parent, backend or storefront. Never write "powered
by KitCommerce", "built on KitCommerce", or describe either project as a
KitCommerce module or layer. There is nothing called KitCommerce to install.

Spell them `GoCommerce` and `Svelte Commerce` — never `Go Commerce`,
`SvelteCommerce` or, in prose, `Svelte-Commerce`. The repository slug is
`svelte-commerce`; the project is two words.

The verifier enforces this mechanically.

## Page structure

Six pages, each with one job. The homepage directs; the project pages explain.

| URL | Its one job |
| --- | --- |
| `/` | choose a project, and prove the software is real |
| `/gocommerce/` | understand GoCommerce |
| `/svelte-commerce/` | understand Svelte Commerce |
| `/svelte-commerce/backends/` | understand backend compatibility |
| `/go-svelte-ecommerce/` | understand how the two fit together |
| `/gocommerce-svelte-commerce-connector/` | understand integration status |

**The homepage is the long one now.** Fifteen sections: hero, proof strip, two
projects, one-command Docker, live admin, live stores, maturity, capability
wall, headless architecture, why-this-stack, agent-friendly, ownership, FAQ,
start building. It argues with screenshots, icons and measured numbers rather
than prose — an earlier revision capped it at four sections, and that was
reversed deliberately.

Nav is five items: GoCommerce, Svelte Commerce, Live admin, Architecture, GitHub. Secondary
navigation lives inside the project pages, not in the header.

### The Docker quick start

`docker-compose.yml` and `env.example` sit at the repository root and are served
from the domain, so the command on the homepage is a real download:

```
curl -O https://kitcommerce.store/docker-compose.yml
curl -o .env https://kitcommerce.store/env.example
docker compose up -d
```

Three services: `postgres`, `gocommerce` (API **and** admin — the admin is
compiled into the binary, so a separate admin service would be theatre) and
`web` (Caddy on port 80). **This was run end to end before it was published** —
all three containers healthy, `/` serving the admin, `/docs` the OpenAPI page,
`/api/products` returning JSON.

It deliberately does **not** start Svelte Commerce. The connector is
unpublished, so a storefront container would boot, serve a page and fail to
load a product. Do not add one to look complete.

GoCommerce builds from source because no image is published; pin a tag in
`build.context` once releases exist. The env template is `env.example`, not
`.env.example`, because Cloudflare Pages may not serve dotfiles and a download
instruction that 404s is worse than none.

### Image distribution

Each image appears on one page, so no page repeats another.

| Page | Images |
| --- | --- |
| `/` | hero composite (admin + Arialshop mobile), four admin tabs, one live-store card |
| `/gocommerce/` | the seven admin screens |
| `/svelte-commerce/` | Arialshop mobile, desktop and product |
| the other three | none — diagrams only |

## Where the numbers come from

Every figure was measured against the repositories on **21 September 2026**,
not estimated.

| Claim | Measured from |
| --- | --- |
| 1 production dependency | the non-indirect `require` block in `go.mod` — `jackc/pgx/v5` |
| 342 documented API operations | 238 in `core/openapi.json` plus 104 across `ext/*/openapi.json` |
| 142 admin endpoints | paths under `/api/admin` in `core/openapi.json` |
| 1,036 tests | `Test`/`Example` functions across `*_test.go` |
| 44 modules | directories in `ext/` |
| 61 admin screens | `+page.svelte` files under `admin/src/routes` |
| 48 migrations | migration markers in `core/schema.go` |
| 17 commerce events | event constants in `core/events.go` |
| 26 connectors, and every coverage score | `svelte-commerce/docs/CONNECTORS.md`, vendored to `data/connectors.json` |
| Star and fork counts | the GitHub API, per repository |

**The site said "6 backends" until 21 September 2026. That was wrong.** There are
26 connectors, at coverage from 39/43 down to 9/43, and the error had propagated
into three pages, `llms.txt` and the schema. The fix was to vendor the real data
rather than retype a summary of it.

`data/connectors.json` carries its own provenance: source repository, read date,
how coverage is measured, and the caveat that no connector has been exercised
against a live production instance. `scripts/build-backends-table.js` generates
the matrix from it.

## Screenshots

`assets/admin/*.webp` are real captures, taken with Playwright at
deviceScaleFactor 2 and encoded as WebP.

- **Admin (7 screens)** — a locally seeded GoCommerce instance at 1440×900. The
  store was filled by the engine's own `scripts/seed-demo.ps1` with a fixed
  random seed, so the same store can be photographed twice: 64 products, 260
  orders across 150 days. Both colour schemes are captured and the page picks
  one with `prefers-color-scheme`.
- **Storefront (3)** — [arialshop.com](https://arialshop.com), a production store
  running Svelte Commerce. Mobile at 390×844, desktop and product at 1440×900.
  The consent banner was **declined**, not accepted, before each capture.

There was also a `storefront-listing.webp`. It was deleted: the capture had
landed on that store's 404 page, so it showed an error screen rather than a
product listing. Do not restore it — retake it.

### Lazy loading

Only screenshots behind an admin tab are lazy — three on the homepage, six on the GoCommerce page. Everything always
visible loads normally, because a lazy image inside a `hidden` panel is never in
the viewport and revealing it does not reliably start the load — the reader gets
a blank frame where a screenshot should be. `app.js` promotes a panel's images
to eager when its tab is selected. Do not add `loading="lazy"` to the first tab
panel or to any image the page shows on arrival.

## What the site deliberately does not claim

- **The Svelte Commerce connector is not published.** GoCommerce is not among
  the 26. `/gocommerce-svelte-commerce-connector/` exists so the answer is one
  link rather than an inference. It is the only thing on the site marked *in
  development*.
- **A coverage score is not a guarantee.** No connector has been run against a
  live production instance of its platform. The backends page says so above the
  table, not in a footnote.
- **No benchmarks.** None are published, so the site makes no speed claim.
- **Nothing on the GoCommerce roadmap is presented as shipped.**
- **Star counts sit with the project they belong to.**

## Hosting

Cloudflare Pages serves `kitcommerce.store` from `main`; a push publishes.
`9aed8449d5c60c850c662366e3d64c9a.txt` is the IndexNow key and must stay at the
site root, byte-exact, no trailing newline.

`_redirects` carries path aliases as 301s. The five real pages are deliberately
**absent** from it — a redirect rule matching one would shadow the page it
points at.

An unmatched path still returns 404 with a **zero-length body** in production.
That is a Cloudflare Pages project setting, not anything here; see the note in
`_redirects`.

`admin.kitcommerce.store` is a deployed GoCommerce instance. It is **not**
publicly explorable — every admin endpoint returns 401 — so the site does not
link to it or advertise a live demo. Adding that CTA needs a read-only demo
account first.

## Verifying a change

```
node scripts/build-faq-schema.js        # fails if any page's FAQ schema is stale
node scripts/build-backends-table.js    # fails if the matrix is stale
```

Both also fail on a canonical that disagrees with the URL they build `@id` from.
Run them before pushing. There is still no CI, and the broader page verifier
(JSON-LD parsing, heading order, alt text, broken links, overflow at 1440/768/400,
forbidden phrasings) lives in the session scratchpad rather than the repository —
checking it in is tracked as outstanding work.

### Two CSS traps, documented because they cost real time

Do not put `min-width` on `.matrix`. A `min-width` on that table escapes its
`.tbl-scroll` container and widens the whole document at phone sizes — measured
at +61px on a 400px viewport, and *not* fixed by `max-width`, `contain:
inline-size`, or `overflow-x: clip` on any ancestor. The cells carry their own
`nowrap` and min-widths, so the table is still wider than a phone and still
scrolls horizontally; it just no longer drags the page with it.

Second: **grid items default to `min-width: auto`**, so any grid track holding a
wide `<pre>` refuses to shrink below its content and pushes the page sideways —
measured at +57px on a 400px viewport — even though the `<pre>` has its own
`overflow-x`. Every grid that can contain code carries `min-width: 0` on its
children for this reason. Do not remove it.

## Still outstanding

Conversion events are now **shipped dark** (§117): `app.js` reads
`window.KC_ANALYTICS` and no-ops entirely when it is absent, so nothing is
requested and nothing is recorded until an analytics object is assigned. The
funnel is named in `data-ev` attributes on the CTAs. No analytics provider is
configured yet. No
`Content-Security-Policy` (§107). Admin screenshots ship a single 1440w
candidate with no `srcset` (§100). Fonts load from Google rather than
self-hosted (§99). Sitemap `lastmod` is maintained by hand (§65). And from
Google's Starter Guide, the one the playbook omits entirely: there is no
off-page or promotion plan, which for two pre-1.0 open-source projects is where
discovery will actually come from.
